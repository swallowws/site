var mesowx = mesowx || {};

mesowx.Config = (function() {
    var Config = {};

    /************************************************************
      Basic configuration parameters
     ************************************************************/

    // the Meso entity ID for raw data configured in the Meso config.json
    Config.rawEntityId = 'weewx_raw';

    // the Meso entity ID for archive data configured in the Meso config.json
    Config.archiveEntityId = 'weewx_archive';

    // the polling interval in milliseconds for the raw real-time data provider
    // this controls how frequently to fetch new data, it should be 
    // set to the frequency that your station generates "LOOP" packets
    Config.realTimePollingInterval = 60000;

    // These define the field defaults and are referred to in other places in this configuration
    // Properties:
    //    fieldID = the Meso-defined field ID from the Meso config.json
    //    unit = the unit to display including the label (value will be converted, if necessary)
    //    decimals = the number of decimals to display (rounding, if necessary)
    //    agg = how to aggregate the field (used when charting)
    //    label = the label to use when referencing the field in the UI
    Config.fieldDefaults = {
        'dateTime':         new meso.FieldDef('dateTime',       meso.Unit.ms,           0,      meso.Agg.avg),
        'outTemp':          new meso.FieldDef('outTemp',        mesowx.Unit.c,          1,      meso.Agg.avg,   'Температура'),
        'rainRate':         new meso.FieldDef('deltarain',      mesowx.Unit.mmHr,       1,      meso.Agg.max,   'Индекс дождя'),
        'dayRain':          new meso.FieldDef('dayRain',        mesowx.Unit.mm,         1,      meso.Agg.max,   'Rain Today'),
        'windSpeed':        new meso.FieldDef('windSpeed',      mesowx.Unit.mps,        0,      meso.Agg.avg,   'Скор. ветра'),
        'windDir':          new meso.FieldDef('windDir',        mesowx.Unit.deg,        0,      meso.Agg.avg,   'Напр. ветра'),
        'maxWind':          new meso.FieldDef('maxWind',        mesowx.Unit.mps,        1,      meso.Agg.avg,   'Порывы ветра'),
        'outHumidity':      new meso.FieldDef('outHumidity',    mesowx.Unit.perc,       0,      meso.Agg.avg,   'Влажность'),
        'barometer':        new meso.FieldDef('pressure',       mesowx.Unit.mmHg,       0,      meso.Agg.avg,   'Давление'),
        'inTemp':           new meso.FieldDef('inTemp',         mesowx.Unit.c,          1,      meso.Agg.avg,   'Темп. устр-ва'),
        'illumination':     new meso.FieldDef('illumination',   mesowx.Unit.lux,        0,      meso.Agg.avg,   'Освещение'),
        'geiger':           new meso.FieldDef('geiger',         mesowx.Unit.cpm,        0,      meso.Agg.avg,   'γ-Излучение'),
        'downfall':         new meso.FieldDef('downfall',       mesowx.Unit.boool,      0,      meso.Agg.avg,   'Осадки')
    };

    // the cardinal direction labels to use (typically used for charts)
    Config.degreeOrdinalLabels = {
        "270" : "З",
        "180" : "Ю",
        "90"  : "В",
        "0"   : "С"
    };

    Config.boolenOrdinalLabels = {
        "1" : "Да",
        "0" : "Нет"
    };

    // The cardinal direction labels in order starting at 0 degrees, assumes equal separation between ordinals
    // the granularity can be changed (e.g. ["N", "E", "S", "W"] will yeild the label "N" for values between 315-45 degrees, 
    // "E" for 45-135 degrees, etc.)
    Config.windDirOrdinalText = ["С","ССВ", "СВ","ВСВ",
                                "В","ВЮВ","ЮВ","ЮЮВ",
                                "Ю","ЮЮЗ","ЮЗ","ЗЮЗ",
                                "З","ЗСЗ","СЗ","ССЗ"];

    // global highcharts options
    Config.highchartsOptions = {
        // see http://api.highcharts.com/highstock#global
        global: {
            useUTC: false
        },
        // see http://api.highcharts.com/highstock#lang
        lang: {
        }
        // theme, see http://api.highcharts.com/highcharts#Highcharts.setOptions
    };


    /************************************************************
      Advanced Configuration parameters
     ************************************************************/

    // Data provider instances
    // raw data provider
    Config.rawDataProvider = new meso.AggregateDataProvider({
        baseUrl: "meso/data.php?entity_id=" + Config.rawEntityId
    });
    // real-time raw data provider
    Config.realTimeDataProvider = new meso.PollingRealTimeRawDataProvider({
        pollingInterval : Config.realTimePollingInterval,
        aggregateDataProvider : Config.rawDataProvider
    });
    // archive data provider
    Config.archiveDataProvider = new meso.AggregateDataProvider({
        baseUrl: "meso/data.php?entity_id=" + Config.archiveEntityId
    });
    // raw stats data provider
    Config.rawStatsDataProvider = new meso.StatsDataProvider({
        url: "meso/stats.php",
        entityId: Config.rawEntityId
    });
    // archive stats data provider
    Config.archiveStatsDataProvider = new meso.StatsDataProvider({
        url: "meso/stats.php",
        entityId: Config.archiveEntityId
    });


    // function to use for determining direction labels
    Config.defaultDegreeToCardinalTextConverter = 
            mesowx.Util.createDegreeToCardinalTextConverter(Config.windDirOrdinalText);

    // defaults for chart components (axes, series definitions, chart options, etc)
    Config.chartDefaults = {};

    // The common "bucket" of x-axis definitions, referred to by chart configurations.
    // Refer to http://api.highcharts.com/highstock#xAxis for highStockAxisOptions parameters
    Config.chartDefaults.xAxes = {
        "dateTime" : {
            field: 'dateTime', // the dateTime entity field ID
            highstockAxisOptions : {
                minRange : null //2*60*1000; // 2 minutes
            }
        }
    };

    // The common "bucket" of y-axis definitions, referred to by chart configurations.
    // Refer to http://api.highcharts.com/highstock#yAxis for highStockAxisOptions parameters
    Config.chartDefaults.yAxes = {
        // temp axis
        "temp" : { 
            axisId : "tempAxis",
            unit : Config.fieldDefaults.outTemp.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Температура',
                    style: {color: '#2945D1'},
                },
                height : 120,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
            }
        },
        // barameter axis
        "barometer" : {
            axisId : "barometerAxis",
            unit : Config.fieldDefaults.barometer.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Давление',
                    style: {color: '#00CD74'}
                },
                height : 120,
//                top: 240,
//                offset: 0,
                //min: 700,
                //max: 800,
                opposite: true,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0'
            },
        },
        
        
        // wind speed axis
        "windSpeed" : {
            axisId : "windSpeedAxis",
            unit : Config.fieldDefaults.windSpeed.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Ветер',
                    style: {color: '#C35050'}
                },
                height : 120,
                top : 200,
                offset: 0,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                min: 0,
                maxPadding: 0,
            },
        },
        // wind dir axis
        "windDir" : {
            axisId : "windDirAxis",
            unit : Config.fieldDefaults.windDir.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Напр. ветра',
                    style: {color: '#A0A0A0'}
                },
                height : 120,
                top : 200,
                opposite: true,
                min: 0,
                max: 360,
                offset: 0,
                TickInterval: 90,
                labels: { formatter:
                     function() {
                        return Config.degreeOrdinalLabels[this.value.toString()]; 
		    }
                }
           },
        },
        // wind max axis
        "maxWind" : {
            axisId : "maxWindAxis",
            unit : Config.fieldDefaults.maxWind.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Порывы ветра',
                    style: {color: '#C7CB51'}
                },
                height : 120,
                top : 200,
                opposite: true,
                min: 0,
                offset: 20,
                TickInterval: 90
           },
        },
        
        
        // rain rate axis
        "rainRate" : {
            axisId : "rainRateAxis",
            unit : Config.fieldDefaults.rainRate.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Дождь',
                 style: {color: '#5CD6E9'}
                },
                height : 120,
                top : 365,
                offset: 0,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                //min: 0,
            },
        },
        // downfall
        "downfall" : {
            axisId : "downfallAxis",
            unit : Config.fieldDefaults.downfall.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Осадки',
                 style: {color: '#FD661B'}
                },
                height : 120,
                top : 365,
                offset: 15,
                opposite: true,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                min: '0',
                max: '1',
                labels: { formatter: function() {
                        return Config.boolenOrdinalLabels[this.value.toString()]; 
		    }
                }
            },
        },


        // humidity axis
        "humidity" : {
            axisId : "humidityAxis",
            unit : Config.fieldDefaults.outHumidity.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Влажность',
                    style: {color: '#00994C'}
                },
                height : 120,
                top : 365,
                offset: 0,
                min: 0,
                max: 100,
                opposite: true,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
               // min: 0,
               // max: 100,
               // tickInterval: 25,
            }
        },
        
        
        // illumination axis
        "illumination" : { 
            axisId : "illuminationAxis",
            unit : Config.fieldDefaults.illumination.unit,
            highstockAxisOptions : {
                title: {
                    text: 'Освещение',
                    style: {color: '#404040'}
                },
                height : 120,
                top : 525,
                min: 0,
                offset: 30,
                opposite: true,
                offset: 0,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
            }
        },
        // geiger axis
        "geiger" : { 
            axisId : "geigerAxis",
            unit : Config.fieldDefaults.geiger.unit,
            highstockAxisOptions : {
                title: {
                    text: 'γ-Излучение',
                    style: {color: '#D008C9'}
                },
                height : 120,
                top : 525,
                min: 0,
//                max: 50,
                offset: 0,
                opposite: false,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
            } 
        }
    };

    // The common "bucket" of chart data series definitions, referred to by chart configurations.
    // This is the data that will be displayed on the chart, and is always associated with an
    // axis. Obviously that axis must also be configured on the chart in order to be used.
    // Refer to http://api.highcharts.com/highstock#plotOptions for highStockSeriesOptions parameters
    Config.chartDefaults.series = {
        // out temp
        "outTemp" : {
            fieldDef : Config.fieldDefaults.outTemp,
            axis : 'tempAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
                color: '#2945D1',
                lineWidth: 1,
                zIndex: 0, // so it's above wind chill & heat index

            },
            statsFlagsHighstockSeriesOptions : {
                zIndex: 110 // display above the windchill and heat index flags
            }
        },
        // in temp
        "inTemp" : {
            fieldDef : Config.fieldDefaults.inTemp,
            axis : 'tempAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
               color: '#FF9999',
               lineWidth: 1,
               visible: false // default to hidden state
           }
        },
        // barometer
        "barometer" : {
            fieldDef : Config.fieldDefaults.barometer,
            axis : 'barometerAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
            lineWidth: 1,
            color: '#00CD74',
            dashStyle: 'ShortDot'
            }
        },
        
        
        // wind speed
        "windSpeed" : {
            fieldDef : Config.fieldDefaults.windSpeed,
            axis : 'windSpeedAxis',
            stats : [meso.Stat.max],
            highstockSeriesOptions : {
                color: '#C35050',
                lineWidth: 1,
                radiusPlus: 10,
                zIndex: 0
            },
            statsFlagsHighstockSeriesOptions : {
                zIndex: 110 // display above the windchill and heat index flags
            }
        },
        // wind dir
        "windDir" : {
            fieldDef : Config.fieldDefaults.windDir,
            axis : 'windDirAxis',
            highstockSeriesOptions : {
                color: '#A0A0A0',
                lineWidth: 1,
                visible: true,
                dashStyle: 'ShortDot'
            }
        },
        // wind max
        "maxWind" : {
            fieldDef : Config.fieldDefaults.maxWind,
            axis : 'maxWindAxis',
            highstockSeriesOptions : {
                color: '#C7CB51',
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 1
                },
                visible: true,
//                dashStyle: 'ShortDot'
            }
        },
        
        
        // day rain
        "dayRain" : {
            fieldDef : Config.fieldDefaults.dayRain,
            axis : 'rainAxis',
            highstockSeriesOptions : {
            }
        },
        // rain rate
        "rainRate" : {
            fieldDef : Config.fieldDefaults.rainRate,
            axis : 'rainRateAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
                color: '#5CD6E9',
                lineWidth: 1
            }
        },
        // downfall
        "downfall" : {
            fieldDef : Config.fieldDefaults.downfall,
            axis : 'downfallAxis',
            highstockSeriesOptions : {
                color: '#FD661B',
                lineWidth: 1
            }
        },
        // out humidity
        "outHumidity" : {
            fieldDef : Config.fieldDefaults.outHumidity,
            axis : 'humidityAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
                dashStyle: 'ShortDot',
                color: '#00994C',
                lineWidth: 1
            }
        },
        
        
        // illumination axis
        "illumination" : {
            fieldDef : Config.fieldDefaults.illumination,
            axis : 'illuminationAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
                height : 100,
                top : 500,
                min: 0,
                offset: 0,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                color: '#404040',
                lineWidth: 1
            }
        },
        // geiger axis
        "geiger" : {
            fieldDef : Config.fieldDefaults.geiger,
            axis : 'geigerAxis',
            stats : [meso.Stat.min, meso.Stat.max],
            highstockSeriesOptions : {
                height : 100,
                top : 500,
                min: 0,
                offset: 0,
                minorTickInterval: 'auto',
                minorGridLineColor: '#F0F0F0',
                color: '#D008C9',
                lineWidth: 1,
                dashStyle: 'ShortDot'
            } 
        }
    };

    // RawChart configuraion
    // Displays "raw"/LOOP data.
    Config.rawChartOptions = {
        aggregateDataProvider : Config.rawDataProvider,
        statsDataProvider: Config.rawStatsDataProvider,
        // the x-axis to use
        xAxis : meso.Util.applyDefaults( {
            highstockAxisOptions : {
                // have to set this otherwise the range selector buttons won't be enabled initially
                minRange : 2*1000 // 2 seconds
            }
        }, Config.chartDefaults.xAxes.dateTime ),
        // the y-axis to display
        yAxes : [
            Config.chartDefaults.yAxes.temp,
            Config.chartDefaults.yAxes.barometer,
            Config.chartDefaults.yAxes.windSpeed,
            Config.chartDefaults.yAxes.windDir,
            Config.chartDefaults.yAxes.maxWind,
            // Uncomment the following line and the dayRain series below if you have a Davis station and want to display it
            //Config.chartDefaults.yAxes.rain,
            Config.chartDefaults.yAxes.rainRate,
            Config.chartDefaults.yAxes.humidity,
            Config.chartDefaults.yAxes.illumination,
            Config.chartDefaults.yAxes.geiger,
            Config.chartDefaults.yAxes.downfall
        ],
        // the data to display (note: the axis of any seires listed here must also be included as a y-axis)
        series : [
            Config.chartDefaults.series.outTemp,
            Config.chartDefaults.series.barometer,
            Config.chartDefaults.series.windSpeed,
            Config.chartDefaults.series.windDir,
            Config.chartDefaults.series.maxWind,
            // Uncomment the following line and the rain axis above if you have a Davis station and want to display it
            //Config.chartDefaults.series.dayRain,
            Config.chartDefaults.series.rainRate,
            Config.chartDefaults.series.outHumidity,
            Config.chartDefaults.series.inTemp,
            Config.chartDefaults.series.illumination,
            Config.chartDefaults.series.geiger,
            Config.chartDefaults.series.downfall
        ],
        // see http://api.highcharts.com/highstock
        highstockChartOptions : {
            chart : {
                renderTo: 'charts-container', 
            },
            legend : {
                enabled: true,
                borderWidth: 0
            },
           rangeSelector : {
                enabled: true,
                selected : 5,
                buttons: [{
                    type: 'minute',
                    count: 15,
                    text: '15м'
                }, {
                    type: 'hour',
                    count: 1,
                    text: '1ч'
                }, {
                    type: 'hour',
                    count: 3,
                    text: '3ч'
                }, {
                    type: 'hour',
                    count: 6,
                    text: '6ч'
                }, {
                    type: 'hour',
                    count: 12,
                    text: '12ч'
                }, {
                    type: 'all',
                    text: '24ч'
                }],
                inputDateFormat : "%l:%M:%S%P",
                inputEditDateFormat : "%l:%M:%S%P",
            }
        }
    };

    // RealTimeChart configuraion
    // Displays "raw"/LOOP data updated in real-time.
    Config.realTimeChartOptions = {
        aggregateDataProvider : Config.rawDataProvider,
        realTimeDataProvider: Config.realTimeDataProvider,
        statsDataProvider: Config.rawStatsDataProvider,
        // the x-axis to use
        xAxis : Config.chartDefaults.xAxes.dateTime,
        // the y-axis to display
        yAxes : [
            Config.chartDefaults.yAxes.temp,
            Config.chartDefaults.yAxes.barometer,
            Config.chartDefaults.yAxes.windSpeed,
            Config.chartDefaults.yAxes.windDir,
            Config.chartDefaults.yAxes.maxWind,
            // Uncomment the following line and the dayRain series below if you have a Davis station and want to display it
            //Config.chartDefaults.yAxes.rain,
            Config.chartDefaults.yAxes.rainRate,
            Config.chartDefaults.yAxes.humidity,
            Config.chartDefaults.yAxes.illumination,
            Config.chartDefaults.yAxes.geiger,
            Config.chartDefaults.yAxes.downfall
        ],
        // the data to display (note: the axis of any seires listed here must also be included as a y-axis)
        series : [
            Config.chartDefaults.series.outTemp,
            Config.chartDefaults.series.barometer,
            Config.chartDefaults.series.windSpeed,
            Config.chartDefaults.series.windDir,
            Config.chartDefaults.series.maxWind,
            // Uncomment the following line and the rain axis above if you have a Davis station and want to display it
            //Config.chartDefaults.series.dayRain,
            Config.chartDefaults.series.rainRate,
            Config.chartDefaults.series.outHumidity,
            Config.chartDefaults.series.inTemp,
            Config.chartDefaults.series.illumination,
            Config.chartDefaults.series.geiger,
            Config.chartDefaults.series.downfall
        ],
        // see http://api.highcharts.com/highstock
        highstockChartOptions : {
            chart : {
                renderTo: 'charts-container', 
                minRange: 120000 // 2 minutes
            },
            legend : {
                enabled: true,
                borderWidth: 0
            },
            rangeSelector : {
                enabled: true,
                selected : 3,
                buttons: [{
                    type: 'minute',
                    count: 2,
                    text: '2м'
                }, {
                    type: 'minute',
                    count: 5,
                    text: '5м'
                }, {
                    type: 'minute',
                    count: 10,
                    text: '10м'
                }, {
                    type: 'all',
                    text: 'всё'
                }],
                inputDateFormat : "%l:%M:%S%P",
                inputEditDateFormat : "%l:%M:%S%P"
            }
        }
    };

    // ArchiveChart configuraion
    // Displays archive data.
    Config.archiveChartOptions = {
        aggregateDataProvider: Config.archiveDataProvider,
        statsDataProvider: Config.archiveStatsDataProvider,
        // the max range to fetch stats for, tweak as needed, or remove for no limit
        maxStatRange: 120 * 86400000, // 120 days
        xAxis : meso.Util.applyDefaults( {
            highstockAxisOptions : {
                // have to set this otherwise the range selector buttons won't be enabled initially
                minRange : 5*60*1000 // 5 minutes
            }
        }, Config.chartDefaults.xAxes.dateTime ),
        yAxes : [
            Config.chartDefaults.yAxes.temp,
            Config.chartDefaults.yAxes.barometer,
            Config.chartDefaults.yAxes.windSpeed,
            Config.chartDefaults.yAxes.windDir,
            Config.chartDefaults.yAxes.maxWind,
            Config.chartDefaults.yAxes.humidity,
            Config.chartDefaults.yAxes.illumination,
            Config.chartDefaults.yAxes.geiger,
            Config.chartDefaults.yAxes.downfall            
        ],
        // the data to display (note: the axis of any seires listed here must also be included as a y-axis)
        series : [
            Config.chartDefaults.series.outTemp,
            Config.chartDefaults.series.inTemp,
            Config.chartDefaults.series.barometer,
            Config.chartDefaults.series.windSpeed,
            Config.chartDefaults.series.windDir,
            Config.chartDefaults.series.maxWind,
            Config.chartDefaults.series.rainRate,
            Config.chartDefaults.series.outHumidity,
            Config.chartDefaults.series.illumination,
            Config.chartDefaults.series.geiger,
            Config.chartDefaults.series.downfall,
        ],
        // see http://api.highcharts.com/highstock
        highstockChartOptions : {
            chart : {
                renderTo: 'charts-container', 
            },
            legend : {
                enabled: true,
                borderWidth: 0
            },
            rangeSelector : {
                enabled: true,
                selected : 5,
                buttons: [{
                    type: 'day',
                    count: 1,
                    text: '1д.'
                }, {
                    type: 'week',
                    count: 1,
                    text: '1н.'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1м.'
                }, {
                    type: 'ytd',
                    text: 'снг'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1г.'
                }, {
                    type: 'all',
                    text: 'всё'
                }]
            }
        }
    };

    // console
    // Displays the latest "raw"/LOOP data fresh off of your station, updated in real-time.
    Config.consoleOptions = {
        containerId : "mesowx-console",
        realTimeDataProvider : Config.realTimeDataProvider,
        // the fields to display
        // The 'id' property is used to alias the field so that it can be referenced elsewhere by it, it defaults to the fieldId
        // By default, the data value is rendered into the HTML element with the class name convetion: '<id>-value' (e.g. 'outTemp-value') and
        // will visually indicate whether the value went up or down since the last update. This can be changed or disabled by specifying a
        // different 'valueDisplayManagerFactory' such as the meso.MesoConsole.SimpleValueDisplayManagerFactory which will only update the
        // value without any other change indication. If present, the field's unit suffix label will be rendered into the HTML element with 
        // the class name convetion: '<id>-unit' (eg. 'outTemp-unit'). A function to format the value can be optionally specified as seen below.
        fields: [
            { fieldDef: Config.fieldDefaults.outTemp, id: 'outTemp' },
           // { fieldDef: Config.fieldDefaults.dayRain },
            { fieldDef: Config.fieldDefaults.rainRate, id: 'rainRate' },
            { fieldDef: Config.fieldDefaults.illumination },
            { fieldDef: Config.fieldDefaults.geiger, id: 'geiger' },
            { fieldDef: Config.fieldDefaults.outHumidity },
            { fieldDef: Config.fieldDefaults.barometer },
            { fieldDef: Config.fieldDefaults.windSpeed },
            {
                fieldDef: Config.fieldDefaults.windDir, 
                valueFormatter : Config.defaultDegreeToCardinalTextConverter,
                valueDisplayManagerFactory: meso.MesoConsole.SimpleValueDisplayManagerFactory
            },
            {
                fieldDef: Config.fieldDefaults.dateTime,
                valueFormatter : function(value) {
                    // see http://api.highcharts.com/highstock#Highcharts.dateFormat
                    return Highcharts.dateFormat('%I:%M:%S %P', value);
                },
                valueDisplayManagerFactory: meso.MesoConsole.SimpleValueDisplayManagerFactory
            }
        ],
        // the IDs of specific fields for custom functionality (e.g. rainRate will only show when it's raining)
        // the ID value should reference a field by the 'id' property (or fieldId) defined in the 'fields' list above.
        rainRateFieldId: 'rainRate',
        outTempFieldId: 'outTemp'
    };
    // wind compass
    // Displays a compass to display wind direction along with the wind speed updated in real-time.
    Config.windCompassOptions = {
        windCompassConfig : {
            containerId: 'compass', 
            maxPrevDirs : 0,
            windDirToCardinalLabelConverterFunction : Config.defaultDegreeToCardinalTextConverter
        },
        realTimeDataProvider : Config.realTimeDataProvider,
        windSpeedFieldDef : Config.fieldDefaults.windSpeed,
        windDirFieldDef : Config.fieldDefaults.windDir, 
        dateTimeFieldDef : Config.fieldDefaults.dateTime
    }

    return Config;
})();
