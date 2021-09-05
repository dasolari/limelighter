/* eslint-disable no-plusplus */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';


export default class GroupEdit extends React.Component {
  constructor(props) {
    super(props);
    const { group } = this.props;
    this.group = JSON.parse(group);
    this.state = {
      name: this.group.name,
      genre: this.group.genre,
      description: this.group.description,
      avaincies: this.group.avaincies,
      instruments: this.group.instruments ? this.group.instruments : [],
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
      if (eventValue < this.group.avaincies) {
        vError = <label id="warning-label">You can`t reduce the number of available vacancies</label>;
      }
    }
    this.setState({ nameError: nError });
    this.setState({ vacanciesError: vError });
    this.setState({ [eventName]: eventValue });
  }

  render() {
    const {
      name, description, genre, avaincies, instruments, nameError, vacanciesError,
    } = this.state;
    const { genresList, submitPath } = this.props;
    const list = genresList.split(',');

    let header = <h2>Editing Group</h2>;
    if (name) {
      header = <h2>{`Editing ${name}`}</h2>;
    }

    let submitButton = <input type="submit" name="update" value="Update" />;
    if (avaincies < this.group.avaincies) {
      submitButton = <input type="submit" name="update" value="Fix current problems" disabled />;
    }

    let instrumentsLabel = '';
    const instrumentsInput = [];
    instruments.forEach((elem) => {
      instrumentsInput.push(<input type="hidden" name="instruments" value={elem} required />);
    });
    if (avaincies > this.group.avaincies) {
      instrumentsLabel = <label htmlFor="instruments">Desired Instruments:</label>;
      for (let i = this.group.avaincies; i < avaincies; i++) {
        instrumentsInput.push(<input className="desired-instruments" type="text" name="instruments" placeholder="Name the instrument you want..." required />);
      }
    }

    return (
      <form action={submitPath} id="createForm" encType="multipart/form-data" method="post">
        <input type="hidden" name="_method" value="patch" />
        {header}
        <div className="field">
          <label htmlFor="name">Name:</label>
          <input type="text" name="name" value={name} onChange={this.changeHandler} placeholder="New name for your group..." required />
          {nameError}
        </div>
        <div className="field">
          <label htmlFor="description">Description:</label>
          <textarea name="description" value={description} onChange={this.changeHandler} placeholder="Describe the type of group you want..." />
        </div>
        <div className="field">
          <label htmlFor="genre">Genre:</label>
          <select name="genre" value={genre} onChange={this.changeHandler}>
            {list.map((elem) => (
              <option key={elem} value={elem}>{elem}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="avaincies">Vacancies:</label>
          <input type="number" name="avaincies" min="1" value={avaincies} onChange={this.changeHandler} required />
          {vacanciesError}
        </div>
        <div className="field">
          {instrumentsLabel}
          {instrumentsInput.map((elem) => (
            elem
          ))}
        </div>
        <div className="field">
          <label htmlFor="image">Group Picture (optional)</label>
          <input id="image" type="file" name="image" accept="image/png, image/jpeg, image/jpg" />
        </div>
        <div className="field">
          {submitButton}
        </div>
      </form>
    );
  }
}

GroupEdit.propTypes = {
  group: PropTypes.string.isRequired,
  genresList: PropTypes.string.isRequired,
  submitPath: PropTypes.string.isRequired,
};
