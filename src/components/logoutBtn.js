function LogoutBtn(props) {
    const logout = (e) => {
        e.preventDefault()
        ;(async () => {
          const resp = await fetch(props.apiRoot + '/logout', {
            method: 'POST',
            credentials: 'omit',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Token ' + props.authToken,
            },
          })
          if(resp.status === 204 || resp.status === 401) {
            props.onLoggedOut()
          }
        })()
      }
    return (
        <button onClick={logout} style={{float:'right', marginRight:"15px"}}><i className="fa-solid fa-arrow-right-from-bracket"></i></button>
    );
}

export default LogoutBtn;
  