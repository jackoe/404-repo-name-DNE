import React from 'react';
import Heatmap from '../components/Heatmap';
import continuousColorLegend from 'react-vis/dist/legends/continuous-color-legend';
import {getEarlierDate, getPrevSunday, getNextSaturday, dateToString} from '../components/Helpers';

class Reports extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          startDateStringWeek: "",
          endDateStringWeek: "",
          startDateStringYear: "",
          endDateStringYear: "",
          byHourJson: {},
          byDayJson: {}
        };
      }
    
      async componentDidMount() {
        try {
          //hardcoded date range for testing
          //var startDateStringWeek = "2018-02-08";
          //var endDateStringWeek = "2018-02-15";
          //Make timerange for last 7 days to display for weekly aggregation (broken down by hour of day)
          var today = getEarlierDate(0);
          var startDateWeek = getEarlierDate(6);
          var startDateStringWeek = dateToString(startDateWeek);
          var endDateStringWeek = dateToString(today);
          const byHourAttendanceData = await fetch('http://127.0.0.1:8000/api/reports/byHourAttendance/?startdate=' + startDateStringWeek + '&enddate=' + endDateStringWeek);
          var byHourJson = await byHourAttendanceData.json();
          console.log("byHour: ", byHourJson);
          //Make timerange for last 365 days, extending back to the preceeding sunday and forward to the following sat to display yearly aggregation (broken down by day)
          var startDateYear= getEarlierDate(365);
          startDateYear = getPrevSunday(startDateYear);
          var startDateStringYear = dateToString(startDateYear);
          var endDateYear = getNextSaturday(today);
          var endDateStringYear = dateToString(endDateYear);
          const byDayAttendanceData = await fetch('http://127.0.0.1:8000/api/reports/byDayAttendance/?startdate=' + startDateStringYear + '&enddate=' + endDateStringYear);
          var byDayJson = await byDayAttendanceData.json();
          console.log("byDay: ", byDayJson);
          
          this.setState(function (previousState, currentProps) {
            return {
              startDateStringWeek: startDateStringWeek,
              endDateStringWeek: endDateStringWeek,
              startDateStringYear: startDateStringYear,
              endDateStringYear : endDateStringYear,
              byHourJson: byHourJson,
              byDayJson : byDayJson
            };
          });

          //Delete this block later, this is just here for testing
          var dayData = this.formatDayData(this.state);
          console.log("processed day of year data: ", dayData);
          var hourData = this.formatHourData(this.state);
          console.log("processed hour of week data: ", hourData);

        } catch (e) {
          console.log(e);
        }
      }

      sameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
      }
    
      compareTime(time1, time2) {
        return new Date(time1) > new Date(time2); // true if time1 is later
      }

      //Format json data from day-of-yr endpoint into format usable by heatmap (and also add missing entries)
      formatDayData(state) {
        //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
        var startDateString = state.startDateStringYear;
        var endDateString = state.endDateStringYear;
        var startDate = new Date(startDateString.replace(/-/g, '\/'));
        var endDate = new Date(endDateString.replace(/-/g, '\/'));
        var dateToCompare = startDate;
        var currEntryDate;
        var currIdx = 0;
        var byDayJson = this.state.byDayJson;
        console.log(byDayJson);

        if(byDayJson.length == 0){
          var firstEntry = {"date": startDateString, "daily_visits": 0}
          byDayJson.push(firstEntry);
        }
        //Add dummy date entries for missing dates (dates with no engagements) to json btwn start and end date
        //dateToCompare always incremented by 1
        while (this.compareTime(dateToCompare, endDate) == false) {
          //if reached the end of json but there's still dates to fill in up to the end date, stay on end entry
          if (currIdx > byDayJson.length - 1) {
            currIdx = byDayJson.length - 1;
          }
          currEntryDate = new Date(byDayJson[currIdx]["date"].replace(/-/g, '\/'));
          //identified missing date, so add dummy date entry for missing date
          if (this.sameDay(dateToCompare, currEntryDate) == false) {
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "daily_visits": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json 
            if (currIdx != byDayJson.length - 1 || this.compareTime(currEntryDate, dateToCompare)) {
              byDayJson.splice(currIdx, 0, dateEntryZeroEngagements);
            } else {
              byDayJson.splice(currIdx + 1, 0, dateEntryZeroEngagements);
            }
          }
          dateToCompare.setDate(dateToCompare.getDate() + 1);
          currIdx++;
        }
        //Time to convert updated JSON with missing dates added in into
        //a list called processedData of {"x": integer day of week, "y": integer week # of month, "color": int num engagements per day} objs
        var processedData = [];
        var dayOfWeek, weekNum, dayEntry;
        var currDateObj;
        var mdyArray;
        var d, m, y;
        var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < byDayJson.length; i++) {
          currDateObj = new Date(byDayJson[i]['date'].replace(/-/g, '\/'));
          dayOfWeek = strDays[currDateObj.getDay()];
          weekNum = Math.floor(i / 7);
          mdyArray = byDayJson[i]['date'].split(/\s*\-\s*/g);
          y = mdyArray[0];
          m = mdyArray[1];
          d = mdyArray[2];
          dayEntry = {"x": weekNum, "y": dayOfWeek, "color": byDayJson[i]['daily_visits']};
          processedData.push(dayEntry);
        }
        return processedData;
      }

      //Format json data from hour-of-week endpoint into format usable by heatmap (and also add missing entries)
      formatHourData(state) {
        //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
        var startDateString = state.startDateStringWeek;
        var endDateString = state.endDateStringWeek;
        var startDate = new Date(startDateString.replace(/-/g, '\/'));
        var endDate = new Date(endDateString.replace(/-/g, '\/'));
        var dateToCompare = startDate;
        var currEntryDate;
        var currHour;
        var currIdx = 0;
        var byHourJson = this.state.byHourJson;
        var hourArray = ["14:00:00", "15:00:00", "16:00:00", "17:00:00","18:00:00","19:00:00","20:00:00","21:00:00","22:00:00"];

        //first filter out any entries that have timestamps outside of key operating hours
        byHourJson = byHourJson.filter(function(entry) { 
          var inValidTimeRange = hourArray.includes(entry.time);
          return inValidTimeRange == true;  
         });
        var hourToCompareIdx= 0;
        var hourToCompare = hourArray[0];

        if(byHourJson.length == 0){
          var firstEntry = {"date": startDateString, "time": hourArray[0], "count": 0};
          byHourJson.push(firstEntry);
        }
        //Add dummy date entries for missing date-hour combos (no engagements) to json btwn start and end date
        while (this.compareTime(dateToCompare, endDate) == false) {
          //if reached the end of json but there's still dates to fill in up to the end date, stay on end entry
          if (currIdx > byHourJson.length - 1) {
            currIdx = byHourJson.length - 1;
          }
          currEntryDate = new Date(byHourJson[currIdx]["date"].replace(/-/g, '\/'));
          currHour = byHourJson[currIdx]["time"];
          //identified missing date, so add dummy date entry for missing date
          if (this.sameDay(dateToCompare, currEntryDate) == false) {
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "time": hourToCompare, "count": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json 
            if (currIdx != byHourJson.length - 1 || (this.compareTime(currEntryDate, dateToCompare) && currHour > hourToCompare)){
              byHourJson.splice(currIdx, 0, dateEntryZeroEngagements);
            } else {
              byHourJson.splice(currIdx+1,0, dateEntryZeroEngagements);
            }
          }
          //the two date-hour combos are on same day, but different hours so add the missing hour as a dummy entry
          else if(hourToCompare != currHour){
            var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "time": hourToCompare, "count": 0 };
            //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
            //else add to very end of json 
            if (currIdx != byHourJson.length - 1 || (this.compareTime(currEntryDate, dateToCompare) && currHour > hourToCompare)){
              byHourJson.splice(currIdx, 0, dateEntryZeroEngagements);
            } else {
              byHourJson.splice(currIdx+1,0, dateEntryZeroEngagements);
            }
          }
          //the two date-hour combos match exactly
          currIdx++;
          if(hourToCompare == hourArray[hourArray.length-1]){
           hourToCompare = "next day";
          }
          //on last hour of the current day, increment date and set hour to first hour
          if(hourToCompare == "next day"){
            dateToCompare.setDate(dateToCompare.getDate() + 1);
            hourToCompare = hourArray[0];
            hourToCompareIdx = 0;
          }
          //otherwise just increment the hour
          else{
            hourToCompareIdx++;
            hourToCompare = hourArray[hourToCompareIdx];
          }
        }
    
        //Time to convert updated JSON with missing date-hour combos added in into
        //a list called processedData of {"x": string hour of day, "y": string day of week, "color": int num engagements per day} objs
        var processedData = [];
        var dayOfWeek, hourEntry, hourOfDay;
        var currDateObj;
        var mdyArray;
        var d, m, y;
        var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (var i = 0; i < byHourJson.length; i++) {
          currDateObj = new Date(byHourJson[i]['date'].replace(/-/g, '\/'));
          dayOfWeek = strDays[currDateObj.getDay()];
          hourOfDay = byHourJson[i]['time'];
          mdyArray = byHourJson[i]['date'].split(/\s*\-\s*/g);
          y = mdyArray[0];
          m = mdyArray[1];
          d = mdyArray[2];
          hourEntry = {"x": hourOfDay, "y": dayOfWeek, "color": byHourJson[i]['count']};
          processedData.push(hourEntry);
        }
        return processedData;
      }

      //add this into render later to display heatmaps
    /*<Heatmap 
      data = {this.formatHourData(this.state)}/>
      <Heatmap 
      data = {this.formatDayData(this.state)}/>
      */

    render() {
        return (
            <div className='content'>
                <p>Reports</p>
            </div>
        );
    }
}

export default Reports;