import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <button onClick={() => invoke('install_update')}>update</button>
);
