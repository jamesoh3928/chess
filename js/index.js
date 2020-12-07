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
	
	recurse(row, col, rowIncrement, colIncrement, range) {
		if (row < 0 || row > 7 || col < 0 || col > 7 || range <= 0) {
			return;
		}

		if (GAME_BOARD[row][col].piece !== null && GAME_BOARD[row][col].piece.isBlack === this.isBlack) {
			return;
		}

		this.moves.push({row, col});
		GAME_BOARD[row][col].validPieces.push(this);

		if (GAME_BOARD[row][col].piece === null) {
			this.recurse(row + rowIncrement, col + colIncrement, rowIncrement, colIncrement, --range);
		}
	}
	
	calculateKnight(){
		const piece = this;
		function push(row, col) {
			if (row >= 0 && row <= 7 && col >= 0 && col <= 7 && (GAME_BOARD[row][col].piece === null || GAME_BOARD[row][col].piece.isBlack !== piece.isBlack)) {
				piece.moves.push({row, col});
				GAME_BOARD[row][col].validPieces.push(piece);
			}
		}
		
		const ones = [1, -1]
		const twos = [2, -2]
		for (const one of ones) {
			for (const two of twos) {
				push(this.position.row + one, this.position.col + two);
				push(this.position.row + two, this.position.col + one);
			}
		}
	}
	
	calculatePawn() {
		const piece = this;
		function recurseVertical(row, col, rowIncrement, range) {
			if (row < 0 || row > 7 || col < 0 || col > 7 || range <= 0) {
				return;
			}

			if (GAME_BOARD[row][col].piece !== null) {
				return;
			}

			piece.moves.push({row, col});
			GAME_BOARD[row][col].validPieces.push(piece);

			if (GAME_BOARD[row][col].piece === null) {
				recurseVertical(row + rowIncrement, col, rowIncrement, --range);
			}
		}
		
		const range = (piece.position.row === 1 && !piece.isBlack ) || (piece.position.row === 6 && piece.isBlack) ? 2 : 1;
		const rowInc = (this.isBlack ? -1 : 1);
		recurseVertical(this.position.row + rowInc, this.position.col, rowInc, range);
		
		this.recurse(this.position.row + rowInc, this.position.col + 1, 0, 0, 1);
		this.recurse(this.position.row + rowInc, this.position.col - 1, 0, 0, 1);
		
	}
	
	calculateOrthogonal(range = 7) {
		this.recurse(this.position.row + 1, this.position.col, 1, 0, range);
		this.recurse(this.position.row - 1, this.position.col, -1, 0, range);
		this.recurse(this.position.row, this.position.col + 1, 0, 1, range);
		this.recurse(this.position.row, this.position.col - 1, 0, -1, range);
	}
	
	calculateDiagonal(range = 7) {
		this.recurse(this.position.row + 1, this.position.col + 1, 1, 1, range);
		this.recurse(this.position.row + 1, this.position.col - 1, 1, -1, range);
		this.recurse(this.position.row - 1, this.position.col + 1, -1, 1, range);
		this.recurse(this.position.row - 1, this.position.col - 1, -1, -1, range);
	}
	
	calculateValidPawnMoves() {
		if (this.type !== "pawn") {
			return this.moves;
		}
		
		const validMoves = [];
		for (const move of this.moves) {
			
		}
		
		return [];
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
				break;
			}
			case "knight": {
				this.calculateKnight();
				break;
			}
			case "bishop": {
				this.calculateDiagonal();
				break;
			}
			case "king": {
				this.calculateOrthogonal(1);
				this.calculateDiagonal(1);
				break;
			}
			case "queen": {
				this.calculateOrthogonal();
				this.calculateDiagonal();
				break;
			}
			default: {
				this.calculatePawn();
			}
		}
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
			
			const pieceObj = new Piece(type, row.color, {row: row.number - 1, col: col - 1}, piece);
			GAME_BOARD[row.number - 1][col - 1].piece = pieceObj;
			
			piece.addClass("piece " + type + " " + row.color);
			piece.css("top", (pos.top + 40) + "px");
			piece.css("left", (pos.left + 40) + "px");
			piece.click(function() {
				$(".tile.indicator").remove();
				
				if (piece.hasClass("selected")) {
					piece.removeClass("selected");
				} else {
					$("#board").children(".piece.selected").removeClass("selected");
					piece.addClass("selected");
					
					for (const move of pieceObj.moves) {
						const tile = TILES[COL_LETTERS[move.col] + (move.row + 1)];
						const indicator = $('<div class="tile indicator" />').appendTo("#board");
						indicator.css("bottom", tile.css("bottom"));
						indicator.css("left", tile.css("left"));
					}
				}
				
				//GameState.ClickedPiece = GAME_BOARD[row.number - 1][col - 1];
				/*const piece = GAME_BOARD[row.number - 1][col - 1];
				
				GameState.ClickFlag = $(".tile.indicator").length === 0;
				$(".tile.indicator").removeClass("indicator");
				
				if (GameState.ClickFlag) {
					piece.showIndicator();
				}*/
			});
		}
	}
	
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			if (GAME_BOARD[row][col].piece !== null)
				GAME_BOARD[row][col].piece.calculateMoves();
		}
	}
	console.log(GAME_BOARD);
}

//=====================================
//	EVENTS
//=====================================

$(document).ready(function() {
	onInit();
});
