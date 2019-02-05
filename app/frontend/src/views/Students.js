import React, { Component } from 'react';
import Autocomplete from '../components/Autocomplete';
import Heatmap from '../components/Heatmap';
import { Label } from 'react-bootstrap';
import {getEarlierDate, getPrevSunday, getNextSaturday, dateToString} from '../components/helpers';

class Students extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: 'search',
      studentsJson: {},
      suggestionsArray: [],
      id: null,
      profileData: {},
      heatMapJson: {},
      startDateString: "",
      endDateString: ""
    };
    this.handler = this.handler.bind(this);
  }

  async componentDidMount() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/');
      var studentsJson = await res.json();
      var suggestionsArray = this.makeSuggestionsArray(studentsJson);
      
      this.setState(function (previousState, currentProps) {
        return {
          mode: 'search',
          studentsJson: studentsJson,
          suggestionsArray: suggestionsArray,
          id: null,
          profileData: {},
          heatMapJson: {}
        };
      });
    } catch (e) {
      console.log(e);
    }
  }

  makeSuggestionsArray(suggestions) {
    var array = [];
    var lastHolder1;
    var lastHolder2;
    var tempArray;
    for (var object in suggestions) {
      if (suggestions[object]['last_name'].includes(" ")) {
        tempArray = suggestions[object]['last_name'].split(" ");
        lastHolder1 = tempArray[0];
        lastHolder2 = tempArray[1];
      }
      else {
        lastHolder1 = suggestions[object]['last_name'];
        lastHolder2 = "";
      }
      array.push({
        firstName: suggestions[object]['first_name'],
        lastName1: lastHolder1,
        lastName2: lastHolder2,
        id: suggestions[object]['id']
      });
    }
    return array;
  }

  handler(e, studentId) {
    var state = {
      mode: 'display',
      id: studentId
    };
    this.getStudentProfile(state);
  }

  async getStudentProfile(state) {
    try {
      const studentProfileData = await fetch('http://127.0.0.1:8000/api/students/' + state.id);
      const studentProfileJson = await studentProfileData.json();
      state.profileData = studentProfileJson;
      var startDate= getEarlierDate(30);
      startDate = getPrevSunday(startDate);
      var startDateString = dateToString(startDate);
      //var startDateString = "2018-01-28";
      state.startDateString = startDateString;
      var today = getEarlierDate(0);
      var endDate = getNextSaturday(today);
      var endDateString = dateToString(endDate);
      //var endDateString = "2018-03-03";
      state.endDateString = endDateString;
	  
    const heatMapData = await fetch('http://127.0.0.1:8000/api/reports/individualHeatmap/?student_id=' + state.id + '&startdate=' + startDateString + '&enddate=' + endDateString);
    //console.log(state.id, startDateString, endDateString);
    const heatMapJson = await heatMapData.json();
    //console.log("json: ", heatMapJson);
    state.heatMapJson = heatMapJson;
    //console.log("json added to state: ", state.heatMapJson);

      this.setState(function (previousState, currentProps) {
        return state;
      });
    }
    catch (e) {
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

  formatData(state) {
    //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
    var studentId = state.id;
    var startDateString = state.startDateString;
    var endDateString = state.endDateString;
   // var startDateString = "2018-01-03";
    //var endDateString = "2018-01-31";
    var startDate = new Date(startDateString.replace(/-/g, '\/'));
    var endDate = new Date(endDateString.replace(/-/g, '\/'));
    var dateToCompare = startDate;
    var currEntryDate;
    var currIdx = 0;
    var heatMapJson = this.state.heatMapJson;

    if(heatMapJson.length == 0){
      var firstEntry = {"date": startDateString, "daily_visits": 0}
      heatMapJson.push(firstEntry);
    }
    //Add dummy date entries for missing dates (dates with no engagements) to json btwn start and end date
    //dateToCompare always incremented by 1
    while (this.compareTime(dateToCompare, endDate) == false) {
      //if reached the end of json but there's still dates to fill in up to the end date, stay on end entry
      if (currIdx > heatMapJson.length - 1) {
        currIdx = heatMapJson.length - 1;
      }
      currEntryDate = new Date(heatMapJson[currIdx]["date"].replace(/-/g, '\/'));
      //identified missing date, so add dummy date entry for missing date
      if (this.sameDay(dateToCompare, currEntryDate) == false) {
        var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "daily_visits": 0 };
        //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
        //else add to very end of json 
        if (currIdx != heatMapJson.length - 1 || this.compareTime(currEntryDate, dateToCompare)) {
          heatMapJson.splice(currIdx, 0, dateEntryZeroEngagements);
        } else {
          heatMapJson.splice(currIdx + 1, 0, dateEntryZeroEngagements);
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
    var m, d, y;
    var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (var i = 0; i < heatMapJson.length; i++) {
      currDateObj = new Date(heatMapJson[i]['date'].replace(/-/g, '\/'));
      dayOfWeek = strDays[currDateObj.getDay()];
      weekNum = Math.floor(i / 7);
      mdyArray = heatMapJson[i]['date'].split(/\s*\-\s*/g);
      y = mdyArray[0];
      m = mdyArray[1];
      d = mdyArray[2];
      dayEntry = { "x": dayOfWeek, "y": weekNum+1, "color": heatMapJson[i]['daily_visits']};
      processedData.push(dayEntry);
    }
    console.log("processed data: ", processedData);
    return processedData;
  }

  render() {
    if (this.state.mode === 'search') {
      return (
        <div className='content'>
          <h1> Key Students </h1>
			<div className='container-fluid no-padding'>
				<div className='row justify-content-start'>
					<div className='col-md-12 to-front top-bottom-padding'>
						<Autocomplete
							suggestions={this.state.suggestionsArray}
							handler={this.handler}
						/>
		  			</div>
		  		</div>
		  	</div>  
        </div>
      );
    } 
	
	else if (this.state.mode === 'display') {
      return (
        <div className='content'>
          <h1> Student Profile </h1>
		  <div className='container-fluid no-padding'>
  			<div className='row justify-content-start'>
			  <div className='col-md-4 to-front top-bottom-padding'>
				<Autocomplete
				  suggestions={this.state.suggestionsArray}
				  handler={this.handler}
			    />
			  </div>
			  <div className='col-md-8 top-bottom-padding'>
				Name: {this.state.profileData.first_name} {this.state.profileData.last_name} <br/>
                ID: <Label>N/A</Label> <br/>
                Birthday: xx/xx/xxxx <br/>
                Nickname: N/A <br/>
                Gender: N/A <br/>
                First Attendance: {this.state.profileData.first_attendance} <br/>
                Number of Visits: {this.state.profileData.number_visits} <br/>
			  </div>
        	</div>
		  </div>
      <Heatmap 
        data = {this.formatData(this.state)}/>
		</div>
      );
    }
  }
}

export default Students;
