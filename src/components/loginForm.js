import react from 'react'
import swal from "sweetalert";

const pkg = require('../../package.json');

function LoginForm(props) {
    const usernameInput = react.useRef()
    const passwordInput = react.useRef()

    const onLogin = (e) => {
      e.preventDefault()
      const username = usernameInput.current.value
      const password = passwordInput.current.value
      ;(async () => {
        const resp = await fetch(props.apiRoot + '/login', {
          method: 'POST',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({username, password})
        })
        if(resp.status === 200) {
            const data = await resp.json()
            props.onLoggedIn({
              username,
              token: data.token,
              isSuperuser: data.username === 'rphlo' // could do better
            })
        } else {
          swal('Could not login with those credentials.');
        }
      })()
    }
 
    return (
      <div style={{margin: "15px"}}>
        <form onSubmit={onLogin}>
          <i className="fa-solid fa-user fa-2x fa-fw"></i> <input required autoComplete="off" ref={usernameInput} name="username" type='text' placeholder="Username" className="usernameInput"></input><br/>
          <i className="fa-solid fa-key fa-2x fa-fw"></i> <input required ref={passwordInput} name="password" type='password' placeholder="Password" className="passwordInput"></input><br/>
          <button style={{marginTop: "5px", paddingLeft: 0, paddingRight: 0}} type="submit"><i className="fa-solid fa-right-to-bracket fa-fw"></i> Login</button>
        </form>
        <p><small>This app offers its users the pleasure to listen to their favourite songs in a good old stereo fashion.<br/>No surround sound bullshit here, Good old MPEG-1 standard only.</small></p>
        <p><small>Contact: <a href={'mailto:' + pkg.contact_email}>{pkg.contact_email}</a></small></p>
      </div>
    );
  }
  
  export default LoginForm;
  