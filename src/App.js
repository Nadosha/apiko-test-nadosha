import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import moment from 'moment';
import FullCalendar from 'fullcalendar-reactwrapper';
import Modal from 'react-responsive-modal';
import getDates  from './methods/getDates';
import EventDetailsForm from './EventDetailsForm';

// See the FullCalendar API for details on how to use it:
// https://fullcalendar.io/docs
// We're using fullcalendar-reactwrapper to wrap it in a React
// component.
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      modalOpen: false,
      newEvent: false,
      openedEventTitle: '',
      openedEventId: '',
        reccuringDates: []
    };
    this.fetchAndLoadEvents = this.fetchAndLoadEvents.bind(this);
    this.onEventDrop = this.onEventDrop.bind(this);
    this.onEventResize = this.onEventResize.bind(this);
    this.onEventClick = this.onEventClick.bind(this);
    this.onDayClick = this.onDayClick.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onExitedModal = this.onExitedModal.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.handleEnterKey = this.handleEnterKey.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.handleSelectedDays = this.handleSelectedDays.bind(this);
    this.handleIntervalsSelect = this.handleIntervalsSelect.bind(this);
    this.handleSelecteStartDate = this.handleSelecteStartDate.bind(this);
    this.handleSelecteEndDate = this.handleSelecteEndDate.bind(this);
  }

  transformToFullcalendarEvent(event) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    let eventItem = {
        allDay: true,
        id: event._id,
        title: event.title,
        start,
        end,

    };
    return eventItem;

  }

  updateEventDates(event) {
    // start = midnight on day of in UTC
    // end = start + 24 hours - 1 second
    const momentStart = moment(event.start.toDate());
    let momentEnd = moment(event.start.toDate())
      .add(24, 'hours')
      .add(-1, 'seconds');
    // Use event.end if it's present. 1 day events
    // do not have event.end if they're coming from Fullcalendar.
    if (event.end) {
      momentEnd = event.end;
    }
    axios
      .put(`/api/events/${event.id}`, {
        start: momentStart.toDate(),
        end: momentEnd.toDate(),
      })
      .catch(error => {
        alert('Something went wrong! Check the console.');
        console.log(error);
      });

      let eventItem = {
         allDay: event.allDay,
          id: event.id,
          title: event.title,
          end: momentEnd.toDate(),
          start: momentStart.toDate()
      }

      const { events } = this.state;
      this.setState({ events });
      const updatedEvents = events.map(_event => {
          if (_event.id === eventItem.id) {
              return eventItem
          }
          return _event;
      });
      this.setState({ events: updatedEvents });
  }

  onEventDrop(event) {
    this.updateEventDates(event);
  }

  onEventResize(event) {
    this.updateEventDates(event);
  }

  onEventClick(event) {
    this.setState({
      modalOpen: true,
      openedEventTitle: event.title,
      openedEventId: event.id,
    });
  }

  onCloseModal() {
    // Update the event
    const { openedEventId, openedEventTitle, newEvent, selectedIntervals, selectedDays, selecteStartDate, selecteEndDate } = this.state;
      const reccuringDates =  getDates(selectedIntervals, selectedDays, selecteStartDate, selecteEndDate);
    if(openedEventTitle) {
        if (newEvent) {
            //If created new Event
console.log(reccuringDates);
            if(this.state.checked) {
                axios.post('/api/events', {...newEvent, title: openedEventTitle, reccuringDates: reccuringDates })
                    .then(({data}) => {
                        const {events} = this.state;
                        this.setState({events});
                    })
                    .catch(error => {
                        alert('Something went wrong! Check the console.');
                        console.log(error);
                    });
            } else {
                axios
                    .post('/api/events', {...newEvent, title: openedEventTitle})
                    .then(({data}) => {
                        const {events} = this.state;
                        events.push(this.transformToFullcalendarEvent(data));
                        this.setState({events});
                    })
                    .catch(error => {
                        alert('Something went wrong! Check the console.');
                        console.log(error);
                    });
            }
        } else {
            //If event been updated
            axios
                .put(`/api/events/${openedEventId}`, {title: openedEventTitle})
                .then(({data: updatedEvent}) => {
                    // Find the event in our events array and update it accordingly
                    const {events} = this.state;
                    const updatedEvents = events.map(_event => {
                        if (_event.id === updatedEvent._id) {
                            return this.transformToFullcalendarEvent(updatedEvent);
                        }
                        return _event;
                    });
                    this.setState({events: updatedEvents});
                })
                .catch(error => {
                    alert('Something went wrong! Check the console.');
                    console.log(error);
                });
        }
        // Close modal
        this.setState({
            modalOpen: false,
        });
    } else {
        this.setState({error: "Please enter the text in the field below!"});
      }
  }


  onExitedModal() {
    // Reset state on animation end? Who put this here??
    this.setState({
      openedEventId: '',
      openedEventTitle: '',
      newEvent: false,
    });
  }

  onTitleChange(event) {
    this.setState({ openedEventTitle: event.currentTarget.value });
    this.setState({error: undefined});
  }

  onDelete() {
    const { openedEventId } = this.state;
    axios.delete(`/api/events/${openedEventId}`).then(() => {
      this.fetchAndLoadEvents();
    });
    // Close modal
    this.setState({
      modalOpen: false,
    });
  }

  onDayClick(clickedDate) {

    // clicked date = midnight on day of in UTC
    // start = clicked date
    // end = start + 24 hours - 1 second
    const momentStart = moment(clickedDate.toDate());
    const momentEnd = moment(clickedDate.toDate())
      .add(24, 'hours')
      .add(-1, 'seconds');
    console.log(momentStart, momentEnd);
    const newEvent = {
      title: 'New event',
      start: momentStart.toDate(),
      end: momentEnd.toDate(),
    };
    this.setState({
      newEvent,
      modalOpen: true,
    });
  }

  fetchAndLoadEvents() {
    return axios
      .get('/api/events')
      .then(({ data }) => {
        const newEvents = data.map(this.transformToFullcalendarEvent);
        this.setState({ events: newEvents });
      })
      .catch(error => {
        alert('Something went wrong! Check the console.');
        console.log(error);
      });
  }
  handleEnterKey(event) {
    if(event.charCode === 13) {
      //small ui improvment, all the time tried to press Enter key to save new event. so, now its posssible
        this.onCloseModal()
    }
  }
  handleCheckbox(event) {
    this.setState({checked: event.target.checked});
  }
    handleSelectedDays(selected) {
      let valuesTransform = selected.map((item) => {
          return item.value
      })
      this.setState({selectedDays: valuesTransform});
    }
    handleIntervalsSelect(selected) {

        this.setState({selectedIntervals: selected.value});
    }

    handleSelecteStartDate(date) {
        console.log(date);
        if (date !== null) {
            this.setState({selecteStartDate: moment(date).format("MM/DD/YYYY")});
            console.log("handleSelecteStartDate", moment(date).format("MM/DD/YYYY"));
        }
    }
    handleSelecteEndDate(date) {
        if (date !== null) {
          this.setState({selecteEndDate: moment(date).format("MM/DD/YYYY")});
          console.log("handleSelecteEndDate", moment(date).format("MM/DD/YYYY"));
      }
    }

  componentDidMount() {

    this.fetchAndLoadEvents();
  }
    componentDidUpdate() {
        if(this.state.checked) {
            let reccuringDates =  getDates(this.state.selectedIntervals, this.state.selectedDays, this.state.selecteStartDate, this.state.selecteEndDate);
            console.log("Recurring events => ", reccuringDates);
        }
    }

  render() {
    const {
        events,
        modalOpen,
        openedEventTitle,
        newEvent,
        error,
        checked,
        selectedDays,
        selectedIntervals,
        } = this.state;

    return (
      <div>
        <FullCalendar
          editable={true}
          timezone="UTC"
          events={events}
          eventDrop={this.onEventDrop}
          eventResize={this.onEventResize}
          eventClick={this.onEventClick}
          dayClick={this.onDayClick}
        />
        <Modal
          open={modalOpen}
          onClose={this.onCloseModal}
          onExited={this.onExitedModal}
          center
          closeIconSize={14}
          classNames={{ modal: 'event-modal', closeIcon: 'modal-close' }}
        >
          <h5>{newEvent ? 'New Event' : 'Edit Event'}</h5>
          <EventDetailsForm
            value={openedEventTitle}
            showDelete={!newEvent}
            onChange={this.onTitleChange}
            onKeyPress={this.handleEnterKey}
            onDelete={this.onDelete}
            errorMessage = {error}
            handleCheckbox = {this.handleCheckbox}
            checked = {checked}
            handleSelectedDays = {this.handleSelectedDays}
            selectedDays = {selectedDays}
            selectedIntervals = {selectedIntervals}
            handleIntervalsSelect = {this.handleIntervalsSelect}
            handleSelecteStartDate = {this.handleSelecteStartDate}
            handleSelecteEndDate = {this.handleSelecteEndDate}

          />
        </Modal>
      </div>
    );
  }
}

export default hot(module)(App);
