How to generate static data files
=================================


Load GNAF database
------------------

* Install PostgreSQL and PostGIS (tested against PostgreSQL versions 14 and 15)
* Create database (name assumed to be `gnaf` but can be anything)
* Enable PostGIS extension on database: 
  * `CREATE EXTENSION IF NOT EXISTS postgis;`
* Download database dumps from [gnaf-loader](https://github.com/minus34/gnaf-loader) (see Option 3, GDA2020 version)
* Import database dumps using pg_restore  
  * `pg_restore -d gnaf gnaf-202208.dmp`
  * `pg_restore -d gnaf admin-bdys-202208.dmp`


Generate data files
-------------------

* Run bin/data.ts with PostgreSQL environment variables:
  * `PGDATABASE=gnaf ./bin/data.ts`
* Optional: Pre-compress data files:
  * `gzip -r -v -9 data/`
  * Or for even smaller files: `pigz -r -v -11 data/`
* Upload files to static hosting service / S3 bucket / etc.
