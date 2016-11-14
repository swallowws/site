# Meso Change Log #

## 0.4.0 (2014-05-09) ##

### Features
* Web Services
    * New service to retrieve minimum/maximum statistics for arbitrary time periods
    * Ability to group by day(s), month(s), and year(s)
* AbstractHighstockChart
    * Adding the ability to display stats flags of minimum/maximums for the selected range
    * Configurable deterministic aggregation periods/groupings for lazy-loaded charts
    * Displaying the aggregation period in the chart tooltip for lazy-loaded charts
    * Dynamically choosing the aggregation period based on the available width of the chart for 
      lazy-loaded charts
    * Now loads its own data instead of delegating to subclasses

### Breaking Changes
* No longer supporting SQLite, use MySQL instead
* PHP 5.3 is no longer supported, 5.4+ is now required
* AbstractHighstockChart 'numGroups' configuration parameter is no longer supported
* Properly quoting identifiers in the data web service query


## 0.3.3 (2014-02-16) ##

### Features
* Allowing MySQL port to be configured

### Bug Fixes
* Removed echo statement that was causing update requests to fail in some cases


## 0.3.2 (2014-02-09) ##

### Features
* Improving logging of sync.py plugin to hopefully help with troubleshooting
* Improving error reporting if parsing of JSON data fails

### Bug Fixes
* Handling the display of null values (were getting converted to 0 values)
* Preventing caching of data requests (fixes no real-time updates in IE)


## 0.3.1 (2014-01-29) ##
* Fixed issue with using the sync plugin for weewx so that the table will be automatically created if it 
  doesn't yet exist


## 0.3.0 (2014-01-28) ##

### Features
* Core data services and chart components decoupled into this project, with the weather station 
  application now living under the MesoWx project

### Bug Fixes
* Duplication of TableEntity.getColumnNames() method
* Using <?php instead of just <?
