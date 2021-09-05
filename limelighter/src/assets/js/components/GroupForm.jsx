/* eslint-disable no-plusplus */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';

export default class GroupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      genre: '',
      description: '',
      avaincies: 0,
      nameError: '',
      vacanciesError: '',
    };
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(event) {
    const eventName = event.target.name;
    const eventValue = event.target.value;
    let nError = '';
    let vError = '';
    if (eventName === 'name') {
      if (eventValue !== '' && Number(eventValue)) {
        nError = <lable id="warning-label">The name can´t be just a number</lable>;
      }
    }
    if (eventName === 'avaincies') {
      if (eventValue >= 10) {
        vError = <lable id="warning-label">You shouldn`t allow too many group members</lable>;
      }
    }
    this.setState({ nameError: nError });
    this.setState({ vacanciesError: vError });
    this.setState({ [eventName]: eventValue });
  }

  render() {
    const {
      name, description, genre, avaincies, nameError, vacanciesError,
    } = this.state;
    const { genresList, submitPath } = this.props;
    const list = genresList.split(',');

    let header = <h2>New Group</h2>;
    if (name) {
      header = <h2>{name}</h2>;
    }

    let instrumentsLabel = '';
    const instrumentsInput = [];
    if (avaincies > 1) {
      instrumentsLabel = <label htmlFor="instruments">Desired Instruments:</label>;
      for (let i = 0; i < avaincies - 1; i++) {
        instrumentsInput.push(<input className="desired-instruments" type="text" name="instruments" placeholder="Name the instrument you want..." required />);
      }
    }

    return (
      <form action={submitPath} id="createForm" encType="multipart/form-data" method="post">
        <div className="center">
          {header}
        </div>
        <div className="field">
          <label htmlFor="name">Name:</label>
          <input type="text" name="name" id="name" value={name} onChange={this.changeHandler} placeholder="Your group's name..." required />
        </div>
        {nameError}
        <div className="field">
          <label htmlFor="image">Group Picture (optional)</label>
          <input id="image" type="file" name="image" accept="image/png, image/jpeg, image/jpg" />
        </div>
        <div className="field">
          <label htmlFor="description">Description:</label>
          <textarea name="description" id="description" value={description} onChange={this.changeHandler} placeholder="Describe the type of group you want..." />
        </div>
        <div className="field">
          <label htmlFor="genre">Genre:</label>
          <select name="genre" id="genre" value={genre} onChange={this.changeHandler}>
            {list.map((elem) => (
              <option key={elem} value={elem}>{elem}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="avaincies">Vacancies: (includes yourself)</label>
          <input type="number" name="avaincies" min="1" id="avaincies" value={avaincies} onChange={this.changeHandler} required />
          {vacanciesError}
        </div>
        <div className="field">
          {instrumentsLabel}
          {instrumentsInput.map((elem) => (
            elem
          ))}
        </div>
        <div className="field">
          <input type="hidden" name="rating" value={0.0} />
        </div>
        <div className="field">
          <input type="hidden" name="date" value={Date(Date.now())} />
        </div>
        <div className="field">
          <input type="submit" name="create" value="Create" />
        </div>
      </form>
    );
  }
}

GroupForm.propTypes = {
  genresList: PropTypes.string.isRequired,
  submitPath: PropTypes.string.isRequired,
};
