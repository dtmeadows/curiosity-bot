# curiosity bot
TODO list: 
- [ ] write script to update database
- [ ] get discord bot working (needs to dynamically determine the set)

# how to run 
- `npm install` on fresh git clone 
- `node ./bin/www` to run locally 
- http://localhost:3000 to check it works

# how to update with new sets: 
- download new table: https://mtgjson.com/downloads/all-files/
- open file in sqlite3
```bash
$ sqlite3 AllPrintings.sqlite
```
- do some sql stuff
```sql
-- drop unnecessary tables (everything but cards) 
DROP TABLE IF EXISTS legalities; DROP TABLE IF EXISTS rulings; DROP TABLE IF EXISTS foreign_data; DROP TABLE IF EXISTS meta; DROP TABLE IF EXISTS set_translations; DROP TABLE IF EXISTS tokens;
-- create a new cards table with only the info we require (to reduce DB size)
CREATE TABLE usable_cards AS 
SELECT 
  name,
  setCode,
  number,
  rarity,
  types,
  supertypes
FROM cards;
-- drop old table
DROP TABLE cards; 
-- add index to usable_cards
CREATE INDEX idx_setCode_name ON usable_cards (setCode, name);
-- if you need to update the set drop down list
select name, code from sets where type = 'expansion' and releaseDate >= '2019-01-01' order by releaseDate desc;
-- vacuum database to reduce size
VACUUM;
```
- afterwards make sure `.tables` only lists `usable_cards` and `sets`
- move db over to git repo and double check size. Should be under 10MB if you've done it correctly
- add tests to sample files if needed
- update `current_sample_deck_list.txt` if the current set has changed and if you need a new example deck. This will update the example deck shown in the textarea. 
