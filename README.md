# fossil-bro-bot

how to update with new sets: 
- download new table: https://mtgjson.com/downloads/all-files/
- open file in sqlite3
$ sqlite3 AllPrintings.sqlite
- drop unnecessary tables (everything but cards) 
DROP TABLE IF EXISTS legalities; DROP TABLE IF EXISTS rulings; DROP TABLE IF EXISTS sets; DROP TABLE IF EXISTS foreign_data; DROP TABLE IF EXISTS meta; DROP TABLE IF EXISTS set_translations; DROP TABLE IF EXISTS tokens;
- make sure `.tables` only lists `cards`
- add index to cards
CREATE INDEX idx_setCode_name ON cards (setCode, name);
- vacuum database to reduce size
VACUUM;
- update version in file
- update tests (this is way too manual)