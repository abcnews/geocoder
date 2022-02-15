Load GNAF database
------------------

* Install PostgreSQL 14 and PostGIS
* Create database (name assumed to be `gnaf` but can be anything)
* Enable PostGIS extension on database: 
  * `CREATE EXTENSION IF NOT EXISTS postgis;`
* Download database dumps from [gnaf-loader](https://github.com/minus34/gnaf-loader) (see Option 3)
* Import database dumps using pg_restore  
  * `pg_restore -d gnaf gnaf-202111.dmp`
  * `pg_restore -d gnaf admin-bdys-202111.dmp`


Generate data files
-------------------

* Run bin/data.ts with PostgreSQL environment variables:
  * `PGDATABASE=gnaf ./bin/data.ts`
* Optional: Pre-compress data files:
  * `gzip -9 *.txt`
  * Or ideally, if server handles brotli: `brotli --rm *.txt`
* Upload files to static hosting service / S3 bucket / etc.
