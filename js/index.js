//=====================================
//	CONFIGURABLES
//=====================================

const COL_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const TILES = {};

const GameState = {
	IsWhiteTurn: true,
	ClickedPiece: null
};

// Logic board
const GAME_BOARD = [];
for (let row = 0; row < 8; row++) {
	GAME_BOARD[row] = [];
	
	for (let col = 0; col < 8; col++) {
		GAME_BOARD[row][col] = {
			piece: null,
			validPieces: []
		};
	}
}

//=====================================
//	CORE
//=====================================

class Piece {
	constructor(type, color, position, ref) {
		this.type = type;
		this.isBlack = color === "black";
		this.position = position;
		this.ref = ref;
		this.moves = [];
	}
	
	showIndicator() {
		switch (this.type) {
			case "rook": {
				break;
			}
			case "knight": {
				break;
			}
			case "bishop": {
				break;
			}
			case "king": {
				break;
			}
			case "queen": {
				break;
			}
			default: {
				const offset = this.isBlack ? -1 : 1;
				TILES[COL_LETTERS[this.position.col] + (this.position.row + offset + 1)].addClass("indicator");
				//console.log(COL_LETTERS[this.position.col] + (this.position.row + offset + 1));
			}
		}
	}
	
	recurse(row, col, rowIncrement, colIncrement) {
		if (row < 0 || row > 7 || col < 0 || col > 7) {
			return;
		}

		if (GAME_BOARD[row][col].piece !== null && GAME_BOARD[row][col].piece.isBlack === this.isBlack) {
			return;
		}

		this.moves.push({row, col});
		GAME_BOARD[row][col].validPieces.push(this);

		if (GAME_BOARD[row][col].piece === null) {
			this.recurse(row + rowIncrement, col + colIncrement, rowIncrement, colIncrement);
		}
	}
	
	calculateOrthogonal() {
		this.recurse(this.position.row + 1, this.position.col, 1, 0);
		this.recurse(this.position.row - 1, this.position.col, -1, 0);
		this.recurse(this.position.row, this.position.col + 1, 0, 1);
		this.recurse(this.position.row, this.position.col - 1, 0, -1);
	}
	
	calculateDiagonal() {
		this.recurse(this.position.row + 1, this.position.col + 1, 1, 1);
		this.recurse(this.position.row + 1, this.position.col - 1, 1, -1);
		this.recurse(this.position.row - 1, this.position.col + 1, -1, 1);
		this.recurse(this.position.row - 1, this.position.col - 1, -1, -1);
	}
	
	clearMoves() {
		for (const position of this.moves) {
			for (let i = 0; i < GAME_BOARD[position.row][position.col].validPieces.length; i++) {
				if (GAME_BOARD[position.row][position.col].validPieces[i] === this) {
					GAME_BOARD[position.row][position.col].validPieces.splice(i, 1);
				}
			}
		}
		
		this.moves = [];
	}
	
	calculateMoves() {
		this.clearMoves();
		
		switch (this.type) {
			case "rook": {
				this.calculateOrthogonal();
				
				console.log(this.moves);
				break;
			}
			case "knight": {
				break;
			}
			case "bishop": {
				this.calculateDiagonal();
				
				console.log(this.moves);
				break;
			}
			case "king": {
				break;
			}
			case "queen": {
				this.calculateOrthogonal();
				this.calculateDiagonal();
				
				console.log(this.moves);
				break;
			}
			default: {
				// pawn
			}
		}
		
		console.log(GAME_BOARD);
	}
}

// Initialization function
function onInit() {
	for (let i = 1; i <= 8; i++) {
		const remainder = i % 2;
		
		for (let j = 1; j <= 8; j++) {
			const tile = $('<div></div>').appendTo($("#board"));
			tile.addClass("tile");
			
			if (j % 2 == remainder) {
				tile.addClass("black");
			} else {
				tile.addClass("white");
			}
			
			tile.css("bottom", (12.5 * (i - 1)) + "%");
			tile.css("left", (12.5 * (j - 1)) + "%");
			tile.attr("data-tile-id", COL_LETTERS[j - 1] + i);
			
			TILES[COL_LETTERS[j - 1] + i] = tile;
		}
		
	}
	
	const rows = [
		{number: 1, color: "white", flag: true},
		{number: 8, color: "black", flag: true},
		{number: 2, color: "white"},
		{number: 7, color: "black"}
	];
	for (const index in rows) {
		const row = rows[index];
		
		for (let col = 1; col <= 8; col++) {
			const position = COL_LETTERS[col - 1] + row.number;
			const pos = TILES[position].position();
			const piece = $('<div></div>').appendTo($("#board"));
			
			let type = "pawn";
			if (row.hasOwnProperty("flag")) {
				switch (col) {
					case 1:
					case 8:
						type = "rook";
						break;
					case 2:
					case 7:
						type = "knight";
						break;
					case 3:
					case 6:
						type = "bishop";
						break;
					case 4:
						type = "queen";
						break;
					default:
						type = "king";
				}
			}
			
			if (row.color === "white" && type !== "queen") {
				continue;
			}
			
			const pieceObj = new Piece(type, row.color, {row: row.number - 1, col: col - 1}, piece);
			GAME_BOARD[row.number - 1][col - 1].piece = pieceObj;
			
			piece.addClass("piece " + type + " " + row.color);
			piece.css("top", (pos.top + 40) + "px");
			piece.css("left", (pos.left + 40) + "px");
			piece.click(function() {
				//GameState.ClickedPiece = GAME_BOARD[row.number - 1][col - 1];
				/*const piece = GAME_BOARD[row.number - 1][col - 1];
				
				GameState.ClickFlag = $(".tile.indicator").length === 0;
				$(".tile.indicator").removeClass("indicator");
				
				if (GameState.ClickFlag) {
					piece.showIndicator();
				}*/
				
				pieceObj.calculateMoves();
			});
		}
	}
	
	//console.log(GAME_BOARD);
}

//=====================================
//	EVENTS
//=====================================

$(document).ready(function() {
	onInit();
});
