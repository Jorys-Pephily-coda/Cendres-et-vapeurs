function A2f() {
    return (
        <div className="a2f">
            <h1>2FA</h1>
            <form className="a2f-form">
                <label htmlFor="code">Code de vérification :</label>
                <input type="text" id="code" name="code" required />
                <button type="submit">Vérifier</button>
            </form>
        </div>
    )
}

export default A2f