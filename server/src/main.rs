mod solver;
use crate::solver::solve_puzzle;

use self::solver::puzzle::Puzzle;

use self::solver::puzzle::cell::Cell;

use actix_cors::Cors;
use actix_web::{post, web, App, HttpServer};
use serde::{Deserialize, Serialize};
use solver::puzzle::Step;
#[derive(Deserialize)]
struct PuzzleInput {
    grid: [[u8; 9]; 9],
}

#[derive(Serialize)]
struct PuzzleOutput {
    grid: [[Cell; 9]; 9],
    steps: Vec<Step>,
    solved: bool,
}

#[post("/")]
async fn index(pi: web::Json<PuzzleInput>) -> web::Json<PuzzleOutput> {
    println!("{:?}", pi.grid);
    let mut pro = Puzzle::new(pi.grid);
    match solve_puzzle(&mut pro) {
        Ok(_) => web::Json(PuzzleOutput {
            grid: pro.grid,
            solved: true,
            steps: pro.steps,
        }),
        Err(_) => web::Json(PuzzleOutput {
            grid: pro.grid,
            solved: false,
            steps: pro.steps,
        }),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_header()
            .allow_any_method();
        App::new().wrap(cors).service(index)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
