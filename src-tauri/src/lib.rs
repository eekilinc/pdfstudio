use std::env;
use std::fs;
use std::path::Path;
use tauri::Manager;

#[tauri::command]
fn get_startup_file() -> Option<String> {
    let args: Vec<String> = env::args().collect();
    // Check if a file argument was passed (e.g. app.exe "C:\path\to\doc.pdf")
    for arg in args.iter().skip(1) {
        if !arg.starts_with("--") && arg.to_lowercase().ends_with(".pdf") && Path::new(arg).exists() {
            return Some(arg.clone());
        }
    }
    None
}

#[tauri::command]
fn read_pdf_file(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| format!("Dosya okunamadı: {}", e))
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        Command::new("cmd")
            .args(["/C", "start", "", &url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| e.to_string())?;
        return Ok(());
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = url;
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let icon_bytes = include_bytes!("../icons/icon.png");
                if let Ok(icon) = tauri::image::Image::from_bytes(icon_bytes) {
                    let _ = window.set_icon(icon);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_startup_file, read_pdf_file, open_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
