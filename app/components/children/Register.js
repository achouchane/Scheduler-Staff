var React = require("react");
var helpers = require("../utils/helpers");

class Register extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username: "",
      password: "",
      email:"",
      passwordConfirmation:"",
      userType: "",
      error: ""
    }

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleUserChange(event) {
     this.setState({ [event.target.name]: event.target.value});
  }

  async handleRegister(event) {
    event.preventDefault();
    if (this.state.password !== this.state.passwordConfirmation) {
      this.setState({ error: "Passwords do not match" });
      return;
    }

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.state.username,
          email: this.state.email,
          password: this.state.password,
          userType: this.state.userType
        })
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        this.setState({ error: errorData.message || "Registration failed" });
      }
    } catch (error) {
      this.setState({ error: "Registration failed" });
      console.error(error);
    }
  }
    render() {
      return (
        <div className="container">
            <div className="row" id="loginForm">
                <div className="col m6 offset-m3">
                    <div className="card-panel">
                        <div className="row grey lighten-5">
                            <div className="col s12 center">
                                <h4 className="blue-text text-darken-1">Register</h4>
                                <h4> {this.state.error}</h4>
                            </div>
                        </div>
                        <form method="POST" onSubmit={this.handleRegister}>
                            <div className="row">
                                <div className="col s12">
                                    <input
                                        placeholder="Username"
                                        type="text"
                                        className="validate"
                                        value={this.state.username}
                                        name="username"
                                        onChange={this.handleUserChange}
                                        required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col s12">
                                    <input
                                        placeholder="Email"
                                        type="email"
                                        className="validate"
                                        value={this.state.email}
                                        name="email"
                                        onChange={this.handleUserChange}
                                        required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col s12">
                                    <input
                                        placeholder="Password"
                                        type="password"
                                        className="validate"
                                        value={this.state.password}
                                        name="password"
                                        onChange={this.handleUserChange}
                                        required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col s12">
                                    <input
                                        placeholder="Confirm Password"
                                        type="password"
                                        className="validate"
                                        value={this.state.passwordConfirmation}
                                        name="passwordConfirmation"
                                        onChange={this.handleUserChange}
                                        required />
                                </div>
                            </div>
                            <div className="row">
                                <div className="input-field col s12">
                                    <select name="userType">
                                        <option defaultValue="" disabled selected>Select User Type</option>
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col s12">
                                    <button className="btn waves-effect waves-light btn-large blue accent-3 loginButtons" type="submit" value="Submit" name="action">Register<i className="material-icons right">person_add</i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      );
    }
  };

  module.exports = Register;
