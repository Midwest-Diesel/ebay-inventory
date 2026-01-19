#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::remove_file, process::Command, env};
use std::{fs::File, io::copy};
use std::io::{self, Write};
use reqwest::Client;
use std::path::{Path};
use zip::read::ZipArchive;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct LatestVersionInfo {
  version: String,
}


fn main() {
  dotenv::from_filename(".env.development").ok();

  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .invoke_handler(tauri::generate_handler![
      install_update,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn install_update() {
  println!("Update detected");
  io::stdout().flush().unwrap();

  if let Err(e) = download_update().await {
    println!("Error downloading the update: {}", e);
    io::stdout().flush().unwrap();
    return;
  }

  println!("Update successful, restarting app...");
  io::stdout().flush().unwrap();

  let product_name = "eBay Inventory";
  let install_dir = r"C:\MWD\repos\content\ebay-inventory";

  let batch_script = format!(r#"
    @echo off
    echo Installing update...
    taskkill /F /IM "{product_name}.exe" > NUL 2>&1
    start "" "{install_dir}\{product_name}.exe"
    del "%~f0" & exit
  "#);

  let script_path = r"C:\MWD\repos\content\ebay-inventory\updates\restart_app.bat";
  std::fs::write(script_path, batch_script).unwrap();

  let _ = Command::new("cmd.exe")
    .args(["/C", script_path])
    .spawn();

  std::process::exit(0);
}

async fn download_update() -> Result<(), Box<dyn std::error::Error>> {
  let (product_name, update_json_url, install_dir) = (
      "eBay Inventory",
      "https://raw.githubusercontent.com/Midwest-Diesel/ebay-inventory/refs/heads/main/latest.json",
      r"C:/MWD/repos/content/ebay-inventory");

  let _ = remove_file("C:/mwd/scripts/launch_test.vbs");
  let client = Client::new();
  let res = client
    .get(update_json_url)
    .send()
    .await?
    .json::<LatestVersionInfo>()
    .await?;

  let version_tag = res.version.trim_start_matches('v');
  let version_file = version_tag.replace("-staging", "");
  let url = format!(
    "https://github.com/Midwest-Diesel/ebay-inventory/releases/download/v{}/{}_{}_x64-setup.nsis.zip",
    version_tag, product_name, version_file
  );
  let response = client.get(url).send().await?;
  let zip_path = format!("C:/MWD/repos/content/ebay-inventory/updates/{}_{}_x64-setup.nsis.zip", product_name, version_file);
  let mut dest = File::create(&zip_path)?;
  copy(&mut response.bytes().await?.as_ref(), &mut dest)?;
  println!("Update downloaded successfully.");

  let mut archive = ZipArchive::new(File::open(&zip_path)?)?;
  for i in 0..archive.len() {
    let mut file = archive.by_index(i)?;
    let outpath = Path::new("C:/MWD/repos/content/ebay-inventory/updates/").join(file.name());
    
    if file.name().ends_with('/') {
      std::fs::create_dir_all(&outpath)?;
    } else {
      if let Some(p) = outpath.parent() {
        std::fs::create_dir_all(p)?;
      }
      let mut out_file = File::create(&outpath)?;
      copy(&mut file, &mut out_file)?;
    }
  }
  println!("Update extracted successfully.");

  let installer_path = format!("C:/MWD/repos/content/ebay-inventory/updates/{}_{}_x64-setup.exe", product_name, version_file);
  let _ = Command::new(installer_path)
    .args(["/S", &format!("/D={}", install_dir)])
    .spawn()?;
  println!("Installer executed.");
  Ok(())
}
