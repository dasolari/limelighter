/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';


export default class AcceptPostulation extends React.Component {
  constructor(props) {
    super(props);
    const { postulant, group } = this.props;
    this.postulant = JSON.parse(postulant);
    this.group = JSON.parse(group);
    this.state = {
      form: false,
      closeColor: 'white',
    };
    this.showForm = this.showForm.bind(this);
    this.changeCloseColor = this.changeCloseColor.bind(this);
  }

  showForm() {
    const { form } = this.state;
    if (form) {
      this.setState({ form: false });
    } else {
      this.setState({ form: true });
    }
  }

  changeCloseColor(color) {
    this.setState({ closeColor: color });
  }

  render() {
    const { form, closeColor } = this.state;
    const { acceptPostulationPath } = this.props;

    let display = '';
    if (form) {
      display = (
        <form className="accept-postulation" action={acceptPostulationPath} method="post">
          <div className="field">
            <label>Their instruments:</label>
            <ul>
              {this.postulant.instruments.map((elem) => (
                <li>{elem}</li>
              ))}
            </ul>
          </div>
          <div className="field">
            <label className="add-media" htmlFor="instrument">
              Assign Instrument:
              <MdClose
                color={closeColor}
                onClick={this.showForm}
                onMouseEnter={() => this.changeCloseColor('#142850')}
                onMouseLeave={() => this.changeCloseColor('white')}
                size={20}
              />
            </label>
            <select id="instrument" type="text" name="instrument">
              {this.group.instruments.map((elem) => (
                <option value={elem}>{elem}</option>
              ))}
            </select>
            <input type="submit" name="create" value="Accept" />
          </div>
        </form>
      );
    } else {
      display = (
        <button className="btnReject" type="button" onClick={this.showForm}>View</button>
      );
    }

    return (
      <>
        {display}
      </>
    );
  }
}

AcceptPostulation.propTypes = {
  acceptPostulationPath: PropTypes.string.isRequired,
  postulant: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
};
