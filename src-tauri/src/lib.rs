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
fn write_pdf_file(path: String, contents: Vec<u8>) -> Result<(), String> {
    fs::write(&path, contents).map_err(|e| format!("Dosya kaydedilemedi: {}", e))
}

#[tauri::command]
fn open_pdf_dialog() -> Result<Option<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let script = r#"
            [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
            Add-Type -AssemblyName System.Windows.Forms
            $d = New-Object System.Windows.Forms.OpenFileDialog
            $d.Title = 'PDF Belgesi Seç'
            $d.Filter = 'PDF Belgeleri (*.pdf)|*.pdf|Tüm Dosyalar (*.*)|*.*'
            $d.CheckFileExists = $true
            $d.RestoreDirectory = $true
            $d.Multiselect = $false
            if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
                [Console]::Out.Write($d.FileName)
            }
        "#;
        let output = Command::new("powershell")
            .args(["-STA", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| e.to_string())?;

        let res = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if res.is_empty() {
            Ok(None)
        } else {
            Ok(Some(res))
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(None)
    }
}

#[tauri::command]
fn pick_save_pdf_path(default_name: String) -> Result<Option<String>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let sanitized = default_name.replace('\'', "").replace('"', "");
        let script = format!(
            r#"
            [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
            Add-Type -AssemblyName System.Windows.Forms
            $d = New-Object System.Windows.Forms.SaveFileDialog
            $d.Title = 'PDF Olarak Kaydet'
            $d.Filter = 'PDF Belgeleri (*.pdf)|*.pdf|Tüm Dosyalar (*.*)|*.*'
            $d.FileName = '{}'
            $d.RestoreDirectory = $true
            if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {{
                [Console]::Out.Write($d.FileName)
            }}
            "#,
            sanitized
        );
        let output = Command::new("powershell")
            .args(["-STA", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", &script])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| e.to_string())?;

        let res = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if res.is_empty() {
            Ok(None)
        } else {
            Ok(Some(res))
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = default_name;
        Ok(None)
    }
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
            let icon_bytes = include_bytes!("../icons/icon.png");
            if let Ok(icon) = tauri::image::Image::from_bytes(icon_bytes) {
                for window in app.webview_windows().values() {
                    let _ = window.set_icon(icon.clone());
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_startup_file, 
            read_pdf_file, 
            write_pdf_file,
            open_pdf_dialog,
            pick_save_pdf_path, 
            open_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
