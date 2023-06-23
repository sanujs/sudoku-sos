// #[cfg(feature = "server")]
mod server;

fn main() {
    // if cfg!(server) {
    match server::run_server() {
        Ok(_) => {println!("Ok :)")}
        Err(_) => { println!("Uh oh")}
    }
    // }
}