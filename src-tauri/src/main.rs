#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::{fs::remove_file, process::Command, env};
use std::{fs::File, io::copy};
use std::io::{self, Write};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;
use base64::engine::general_purpose::STANDARD as BASE64_STANDARD;
use base64::Engine;

#[derive(Debug, Deserialize)]
struct LatestVersionInfo {
  version: String,
}

#[derive(Deserialize, Serialize)]
struct PictureArgs {
  part_num: Option<String>,
  stock_num: Option<String>,
  name: Option<String>,
  pic_type: Option<String>
}

#[derive(Deserialize, Serialize)]
struct Picture {
  url: String,
  name: String
}


fn main() {
  dotenv::from_filename(".env.development").ok();

  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      install_update,
      view_file,
      get_file,
      get_stock_num_images,
      get_env_var
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

  let product_name = "eBay-Inventory";
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
      "eBay-Inventory",
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
    "https://github.com/Midwest-Diesel/ebay-inventory/releases/download/v{}/{}_{}_x64-setup.exe",
    version_tag, product_name, version_file
  );
  let exe_path = format!(
    "C:/MWD/repos/content/ebay-inventory/updates/{}_{}_x64-setup.exe",
    product_name,
    version_file
  );

  let response = client.get(&url).send().await?;
  let mut dest = File::create(&exe_path)?;
  copy(&mut response.bytes().await?.as_ref(), &mut dest)?;
  drop(dest);

  println!("Installer downloaded successfully.");

  Command::new(&exe_path)
    .args(["/S", &format!("/D={}", install_dir)])
    .spawn()?;

  println!("Installer executed.");
  Ok(())
}

#[tauri::command]
fn get_env_var(var_name: String) -> Result<String, String> {
  if let Ok(val) = env::var(var_name) {
    return Ok(val);
  }
  return Err("Couldn't find env variable".to_string());
}

#[tauri::command]
fn view_file(app_handle: AppHandle, filepath: String) -> Result<(), String> {
  app_handle
    .opener()
    .open_path(filepath, None::<&str>)
    .map_err(|e| format!("Failed to open: {}", e))
}

#[tauri::command]
fn get_file(filepath: String) -> Result<Vec<u8>, String> {
  fs::read(filepath)
    .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
async fn get_stock_num_images(picture_args: PictureArgs) -> Result<Vec<Picture>, String> {
  let path = "\\\\MWD1-SERVER/Server/Pictures/sn_specific";
  let target_dir = format!("{}/{}", path, picture_args.stock_num.as_deref().unwrap_or(""));
  let mut pictures = Vec::new();

  match std::fs::read_dir(&target_dir) {
    Ok(entries) => {
      for entry in entries {
        let pic_entry = match entry {
          Ok(entry) => entry,
          Err(e) => return Err(format!("Error reading entry: {}", e)),
        };
        let pic_name = pic_entry.file_name().into_string().map_err(|_| "Invalid file name")?;
        let pic_path = pic_entry.path();

        let data = match std::fs::read(&pic_path) {
          Ok(data) => data,
          Err(e) => return Err(format!("Error reading image data: {}", e)),
        };

        let base64_data = BASE64_STANDARD.encode(&data);
        pictures.push(Picture {
          url: base64_data,
          name: pic_name,
        });
      }
      Ok(pictures)
    }
    Err(_) => Ok(vec![]),
  }
}
