// TODO when king capture other piece, check if that is check!!!!!!
class Board {	
	constructor() {
		this.state = []; //TODO Time stone, modify state check if the move makes it 'check'
		this._activePieces = [];
		this._capturedPieces = [];
		this._isBlackTurn = false;
		this._onTurnChange = null;
		this._kings = [];
		
		for (let row = 0; row < 8; row++) {
			this.state[row] = [];

			for (let col = 0; col < 8; col++) {
				this.state[row][col] = {
					piece: null
				};
			}
		}
		
		const rows = [
			{number: 0, color: "white", flag: true},
			{number: 7, color: "black", flag: true},
			{number: 1, color: "white"},
			{number: 6, color: "black"}
		];
		for (const index in rows) {
			const row = rows[index];

			for (let col = 0; col < 8; col++) {
				let type = "pawn";
				if (row.hasOwnProperty("flag")) {
					switch (col) {
						case 0:
						case 7:
							type = "rook";
							break;
						case 1:
						case 6:
							type = "knight";
							break;
						case 2:
						case 5:
							type = "bishop";
							break;
						case 3:
							type = "queen";
							break;
						default:
							type = "king";
					}
				}

				const piece = new Piece(type, row.color, {row: row.number, col}, this);
				this.state[row.number][col].piece = piece;
				this._activePieces.push(piece);
				const ind = (piece.isBlack)? 0: 1;
				if (piece.type == "king")
					this._kings[ind] = piece;
			}
		}

		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				if (this.state[row][col].piece !== null)
					this.state[row][col].piece.calculateMoves();
			}
		}
	}
	
	get activePieces() {
		return this._activePieces;
	}
	
	get capturedPieces() {
		return this._capturedPieces;
	}
	
	get isBlackTurn() {
		return this._isBlackTurn;
	}
	
	set onTurnChange(func) {
		this._onTurnChange = func;
	}
	
	start() {
		if (this._onTurnChange !== null) {
			this._onTurnChange();
		}
	}
	
	movePiece(source, destination) {
		const colLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
		
		function coordinatesToPosition(coordinates) {
			if (coordinates.length !== 2) {
				return false;
			}
			
			const colIndex = colLetters.indexOf(coordinates[0]);
			if (colIndex === -1) {
				return false;
			}

			const rowIndex = parseInt(coordinates[1]) - 1;
			if (rowIndex < 0 || rowIndex > 7) {
				return false;
			}
			
			return {row: rowIndex, col: colIndex};
		}
		
		const sourcePosition = coordinatesToPosition(source);
		if (sourcePosition === false) {
			return false;
		}
		
		const destinationPosition = coordinatesToPosition(destination);
		if (destinationPosition === false) {
			return false;
		}
		
		const piece = this.state[sourcePosition.row][sourcePosition.col].piece;
		if (piece === null) {
			return false;
		}

		let failFlag = true;
		for (const move of piece.moves) {
			if (move.row === destinationPosition.row && move.col === destinationPosition.col) {
				failFlag = false;
				break;
			}
		}
		
		if (failFlag) {
			return false;
		}
		
		// Capture opponent piece
		if (this.state[destinationPosition.row][destinationPosition.col].piece !== null) {
			let capturedPiece = null;
			
			for (let i = 0; i < this._activePieces.length; i++) {
				if (this._activePieces[i] === this.state[destinationPosition.row][destinationPosition.col].piece) {
					capturedPiece = this._activePieces.splice(i, 1)[0];
					this._capturedPieces.push(capturedPiece);
					break;
				}
			}
			
			capturedPiece.clearMoves();
			this.state[destinationPosition.row][destinationPosition.col].piece = null;
		}
		
		this.state[sourcePosition.row][sourcePosition.col].piece = null;
		this.state[destinationPosition.row][destinationPosition.col].piece = piece;
		
		piece.position = {row: destinationPosition.row, col: destinationPosition.col};
		piece.calculateMoves();
		
		for (const currPiece of this._activePieces) {
			if (piece === currPiece) {
				continue;
			}
			
			currPiece.calculateMoves();
		}
		
		this._isBlackTurn = !this._isBlackTurn;
		
		if (this._onTurnChange !== null) {
			this._onTurnChange(this._isBlackTurn);
		}
	}
	
	isChecked(isBlack) {
		let king = null;
		
		for (const piece of this._activePieces) {
			if (piece.isBlack !== isBlack) {
				continue;
			}
			
			if (piece.type === "king") {
				king = piece;
				break;
			}
		}
		
		for (const piece of this._activePieces) {
			if (piece.isBlack === isBlack) {
				continue;
			}
			if (piece.type === "pawn"){
				const rowInc = (piece.isBlack)? -1: 1;
				for (const colInc of [1, -1]) {
					const col = piece.position.col + colInc;
					const row = piece.position.row + rowInc;
					
					if (col > 7 || col < 0 || row > 7 || row < 0)
						continue;
					
					const move = {row, col};
					
					if (move.row === king.position.row && move.col === king.position.col) {
						return true;
					}
				}
				
				continue;	
			}
			
			for (const move of piece.moves) {
				if (move.row === king.position.row && move.col === king.position.col) {
					return true;
				}
			}
		}
		
		return false;
	}
	
	refresh() {
		for (const piece of this._activePieces) {
			piece.calculateMoves();
		}
	}
}

class Piece {
	constructor(type, color, position, board) {
		this.type = type;
		this.isBlack = color === "black";
		this.position = position;
		this.moves = [];
		this.board = board;
	}
	
	recurse(row, col, rowIncrement, colIncrement, range) {
		if (row < 0 || row > 7 || col < 0 || col > 7 || range <= 0) {
			return;
		}

		if (this.board.state[row][col].piece !== null && this.board.state[row][col].piece.isBlack === this.isBlack) {
			return;
		}

		this.moves.push({row, col});

		if (this.board.state[row][col].piece === null) {
			this.recurse(row + rowIncrement, col + colIncrement, rowIncrement, colIncrement, --range);
		}
	}
	
	calculateKnight(){
		const piece = this;
		function push(row, col) {
			if (row >= 0 && row <= 7 && col >= 0 && col <= 7 && (piece.board.state[row][col].piece === null || piece.board.state[row][col].piece.isBlack !== piece.isBlack)) {
				piece.moves.push({row, col});
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

			if (piece.board.state[row][col].piece !== null) {
				return;
			}

			piece.moves.push({row, col});

			if (piece.board.state[row][col].piece === null) {
				recurseVertical(row + rowIncrement, col, rowIncrement, --range);
			}
		}
		
		const range = (piece.position.row === 1 && !piece.isBlack ) || (piece.position.row === 6 && piece.isBlack) ? 2 : 1;
		const rowInc = (this.isBlack ? -1 : 1);
		recurseVertical(this.position.row + rowInc, this.position.col, rowInc, range);
		
		let row = this.position.row + rowInc;
		if (row < 0 || row > 7) {
			return;
		}
	
		for (const offset of [1, -1]) {
			let col = this.position.col + offset;
			
			if (col < 0 || col > 7) {
				continue;
			}
			
			if (this.board.state[row][col].piece !== null && this.isBlack !== this.board.state[row][col].piece.isBlack) {
				this.recurse(row, col, 0, 0, 1);
			}
		}
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
	
	calculateKing() {
		this.moves = [];
		this.calculateOrthogonal(1);
		this.calculateDiagonal(1);
	}
	
	checkKingMoves() {
		const originalPosition = {row: this.position.row, col: this.position.col};
		
		const finalMoves = [];
		
		for (const move of this.moves)	{
			this.position.row = move.row;
			this.position.col = move.col;
			
			if (this.board.isChecked(this.isBlack)){
				continue;
			}
			finalMoves.push({row: this.position.row, col: this.position.col});
		}
		
		this.position.row = originalPosition.row;
		this.position.col = originalPosition.col;
		return finalMoves;
	}
	
	clearMoves() {
		this.moves = [];
	}
	
	calculateMoves() {
		this.clearMoves();
		
		if (this.board.isChecked(this.isBlack)) {
			// timestone
			// return;
		}
		
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
				for (const king of this.board._kings) {
					king.calculateKing();
				}
				let newMoves = []
				for (const king of this.board._kings) {
					newMoves.push(king.checkKingMoves());
				}
				for (let i = 0; i < newMoves.length; i ++) {
					this.board._kings[i].moves = newMoves[i];
				}
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