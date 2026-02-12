import { useState } from "react";
import "../styles/Contact.css";

type FormData = {
  nom: string;
  prenom: string;
  email: string;
  objet: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Contact() {
  const [form, setForm] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    objet: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.nom.trim()) newErrors.nom = "Le nom est requis.";
    if (!form.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!form.email.trim()) {
      newErrors.email = "L'adresse e-mail est requise.";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Veuillez entrer une adresse e-mail valide.";
    }
    if (!form.objet.trim()) newErrors.objet = "L'objet est requis.";
    if (!form.message.trim()) newErrors.message = "Le message est requis.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ nom: "", prenom: "", email: "", objet: "", message: "" });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="contact">
      <div className="contact__card">
        {submitted ? (
          <div>
            <h2 className="contact__success-title">Message envoyé ✓</h2>
            <p className="contact__success-text">Nous vous répondrons dans les meilleurs délais.</p>
            <button className="contact__reset-btn" onClick={handleReset}>
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <>
            <h1 className="contact__title">Contact</h1>
            <p className="contact__subtitle">Tous les champs sont obligatoires.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="contact__row">
                <div className="contact__group">
                  <label className="contact__label" htmlFor="prenom">Prénom</label>
                  <input
                    className={`contact__input${errors.prenom ? " contact__input--error" : ""}`}
                    id="prenom"
                    name="prenom"
                    type="text"
                    placeholder="Jean"
                    value={form.prenom}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                  {errors.prenom && <span className="contact__error">{errors.prenom}</span>}
                </div>

                <div className="contact__group">
                  <label className="contact__label" htmlFor="nom">Nom</label>
                  <input
                    className={`contact__input${errors.nom ? " contact__input--error" : ""}`}
                    id="nom"
                    name="nom"
                    type="text"
                    placeholder="Dupont"
                    value={form.nom}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                  {errors.nom && <span className="contact__error">{errors.nom}</span>}
                </div>
              </div>

              <div className="contact__group">
                <label className="contact__label" htmlFor="email">Adresse e-mail</label>
                <input
                  className={`contact__input${errors.email ? " contact__input--error" : ""}`}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jean.dupont@exemple.fr"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <span className="contact__error">{errors.email}</span>}
              </div>

              <div className="contact__group">
                <label className="contact__label" htmlFor="objet">Objet</label>
                <input
                  className={`contact__input${errors.objet ? " contact__input--error" : ""}`}
                  id="objet"
                  name="objet"
                  type="text"
                  placeholder="Demande d'information"
                  value={form.objet}
                  onChange={handleChange}
                />
                {errors.objet && <span className="contact__error">{errors.objet}</span>}
              </div>

              <div className="contact__group contact__group--last">
                <label className="contact__label" htmlFor="message">Message</label>
                <textarea
                  className={`contact__textarea${errors.message ? " contact__input--error" : ""}`}
                  id="message"
                  name="message"
                  placeholder="Votre message…"
                  value={form.message}
                  onChange={handleChange}
                />
                {errors.message && <span className="contact__error">{errors.message}</span>}
              </div>

              <button type="submit" className="contact__button">
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Contact;