use actix_cors::Cors;
use actix_web::{post, web, App, HttpServer};
use sudoku_sos_solver::{solve_puzzle, SolveOutput};

#[post("/")]
async fn index(si: web::Json<[[u8; 9]; 9]>) -> web::Json<SolveOutput> {
    match solve_puzzle(*si) {
        Ok(so) => web::Json(so),
        Err(so) => web::Json(so),
    }
}

#[actix_web::main]
pub async fn run_server() -> Result<(), std::io::Error> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_header()
            .allow_any_method();
        App::new().wrap(cors).service(index)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
