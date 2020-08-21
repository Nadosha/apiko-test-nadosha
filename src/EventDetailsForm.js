import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import DatePicker from 'react-datepicker2';

const weekDays = [
    {label: "Mondays", value: 1},
    {label: "Tuesdays", value: 2},
    {label: "Wednesdays", value: 3},
    {label: "Thursdays", value: 4},
    {label: "Fridays", value: 5},
    {label: "Saturdays", value: 6},
    {label: "Sundays", value: 7},
];
const intervals = [
    {label: "1", value: 1},
    {label: "2", value: 2},
    {label: "3", value: 3},
    {label: "4", value: 4},
    {label: "5", value: 5},
    {label: "6", value: 6},
    {label: "7", value: 7},
    {label: "8", value: 8},
    {label: "9", value: 9},
    {label: "10", value: 10},
];

const EventDetailsForm = ({
  value,
  placeholder,
  onChange,
  showDelete,
  onDelete,
  onKeyPress,
  errorMessage,
  handleCheckbox,
  checked,
  selectedDays,
  handleSelectedDays,
  handleIntervalsSelect,
  selectedIntervals,
  handleSelecteStartDate,

  handleSelecteEndDate,

}) => {
  return (
    <div>
        {errorMessage && (<p style={{"color": "red"}}>{errorMessage}</p>)}

        <input
        className="event-title"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onKeyPress={onKeyPress}
      />

      {showDelete ? (
        <div className="btn btn-warn" onClick={onDelete}>
          Delete
        </div>
      ) : (
          <div>
            <hr/>
            <h4>{"Recurring events"}</h4>
            <input type="checkbox" onChange={handleCheckbox}/>
              {checked &&
                  <>
                <div>
                    <h5>Interval:</h5>
                      <Select
                          options={intervals}
                          selected={selectedIntervals}
                          onChange={handleIntervalsSelect}/>
                  </div>
                  <div>
                      <h5>Days to repeat:</h5>
                          <Select
                              isMulti
                              options={weekDays}
                              selected={selectedDays}
                              onChange={handleSelectedDays}/>
                  </div>
                  <div>
                      <h5>Start date:</h5>
                      <DatePicker onChange={handleSelecteStartDate}/>
                      <h5>End date:</h5>
                      <DatePicker  onChange={handleSelecteEndDate}/>
                  </div>

                  </>}
          </div>
      )}
    </div>
  );
};

EventDetailsForm.propTypes = {
    errorMessage: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    showDelete: PropTypes.bool,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onKeyPress: PropTypes.func,
    handleCheckboxValue:  PropTypes.func,
    checked: PropTypes.bool,
    handleSelectedDays: PropTypes.func,
    selectedDays: PropTypes.array,
    selectedIntervals: PropTypes.number,
    handleIntervalsSelect: PropTypes.func,
    handleSelecteStartDate: PropTypes.func
};

EventDetailsForm.defaultProps = {
  value: '',
  placeholder: 'Event title',
  showDelete: false,
  onChange: () => {},
  onDelete: () => {},
    checked: false,
    selectedDays: [],
    selectedIntervals: 1
};

export default EventDetailsForm;
