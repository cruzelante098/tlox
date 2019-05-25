import * as Lox from './index';
import { Token } from "./token";
import { TT } from "./token-type";

export class Scanner {
  private readonly source: string;
  private readonly tokens: Token[] = [];

  private readonly Keywords: {[key: string]: TT} = {
    "and": TT.AND,
    "class": TT.CLASS,
    "else": TT.ELSE,
    "false": TT.FALSE,
    "for": TT.FOR,
    "fun": TT.FUN,
    "if": TT.IF,
    "nil": TT.NIL,
    "or": TT.OR,
    "print": TT.PRINT,
    "return": TT.RETURN,
    "super": TT.SUPER,
    "this": TT.THIS,
    "true": TT.TRUE,
    "let": TT.LET,
    "while": TT.WHILE,
  }

  private start: number = 0;
  private current: number = 0;
  private line: number = 1;


  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TT.EOF, "", null, this.line));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case '(':
        this.addToken(TT.LP);
        break;
      case ')':
        this.addToken(TT.RP);
        break;
      case '{':
        this.addToken(TT.RBRACE);
        break;
      case '}':
        this.addToken(TT.RBRACE);
        break;
      case ',':
        this.addToken(TT.COMMA);
        break;
      case '.':
        this.addToken(TT.DOT);
        break;
      case '-':
        this.addToken(TT.MINUS);
        break;
      case '+':
        this.addToken(TT.PLUS);
        break;
      case ';':
        this.addToken(TT.SEMICOLON);
        break;
      case '*':
        this.addToken(TT.STAR);
        break;
      case '!':
        this.addToken(this.match('=') ? TT.BANG_EQUAL : TT.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TT.EQUAL_EQUAL : TT.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TT.LESS_EQUAL : TT.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TT.GREATER_EQUAL : TT.GREATER);
        break;
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TT.SLASH);
        }
        break;
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.                      
        break;
      case '\n':
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          Lox.error(this.line, `Unexpected character: ${c}`);
        }
    }
  }

  private advance(): string {
    this.current++;
    return this.source[this.current - 1];
  }

  // private addToken(type: TokenType): void {
  //   this.addToken(type, null);
  // }

  private addToken(type: TT, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;
    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.current];
  }

  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, "Unterminated string");
      return;
    }

    // consumes the end "
    this.advance();

    // trim "
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TT.STRING, value);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();

    // Look for fractions
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the dot
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(TT.NUMBER, Number(this.source.substring(this.start, this.current)));
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source[this.current + 1];
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const lexeme = this.source.substring(this.start, this.current);
    const type: TT = this.Keywords[lexeme] || TT.IDENTIFIER;
    this.addToken(type);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
