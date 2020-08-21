/**
 * Created by andrey on 20.08.2020.
 */
import moment from 'moment';
export default function getDates(interval, days, startDate, endDate) {

    let dates = [];
    let withInterval = [];
    //Default values for unseted  args:
    interval = interval ? interval : 1;
    days = days ? days : []

    startDate = startDate ? moment.utc(new Date(startDate)).startOf("day") :
        moment.utc(new Date('9/1/2020')).startOf("day");
    endDate = endDate ? moment.utc(new Date(endDate)).startOf("day") : moment.utc(new Date('9/30/2020')).startOf("day");

    do {
        if(days.length) {
            if(days.includes(startDate.clone().day())) {
                dates.push(startDate.clone().format("MM/DD/YYYY"));
            }
        } else {
            dates.push(startDate.clone().format("MM/DD/YYYY"));
        }
    } while (startDate.add(interval, "days").diff(endDate) < 0);


    for (let i = 0; i < dates.length; i = i+interval) {
        console.log(i);
        withInterval.push(dates[i]);
    };

    console.log("recuring ||===>",withInterval);
    return dates;

}

