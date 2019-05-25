export enum TT {
  // Single-character tokens
  LP = "LP",
  RP = "RP",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  COMMA = "COMMA",
  DOT = "DOT",
  MINUS = "MINUS",
  PLUS = "PLUS",
  SEMICOLON = "SEMICOLON",
  SLASH = "SLASH",
  STAR = "STAR",

  // One or two characters tokens
  BANG = "BANG",
  BANG_EQUAL = "BANG_EQUAL",
  EQUAL = "EQUAL",
  EQUAL_EQUAL = "EQUAL_EQUAL",
  GREATER = "GREATER",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS = "LESS",
  LESS_EQUAL = "LESS_EQUAL",

  // Literals
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",

  // Keywords
  AND = "KW_AND",
  CLASS = "KW_CLASS",
  ELSE = "KW_ELSE",
  FALSE = "KW_FALSE",
  FUN = "KW_FUN",
  FOR = "KW_FOR",
  IF = "KW_IF",
  NIL = "KW_NIL",
  OR = "KW_OR",
  PRINT = "KW_PRINT",
  RETURN = "KW_RETURN",
  SUPER = "KW_SUPER",
  THIS = "KW_THIS",
  TRUE = "KW_TRUE",
  LET = "KW_LET",
  WHILE = "KW_WHILE",

  // Other
  EOF = "EOF"
}
