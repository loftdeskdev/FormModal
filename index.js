const createEl = (tag, className) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
};

class Modal {
  constructor(options) {
    this.options = options || {};
    this.modal = null;
    this.modalContent = null;
    this.closeBtn = null;
    this.form = null;
    this.confirmationMessage = null;
    this.isSubmitting = false;
  }

  injectCSS() {
    if (document.querySelector(".formModalCss")) return;
    const style = createEl("style", "formModalCss");
    style.innerHTML = `
      .custom-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
        transition: opacity 0.3s ease;
      }
      .custom-modal *{
        box-sizing: border-box;
      }
      .custom-modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 400px;
        width: 80%;
        text-align: center;
        position: relative;
      }

      .custom-modal h2 {
        margin-bottom: 20px;
        font-size: 1.5rem;
      }

      .custom-modal .form-group {
        margin-bottom: 15px;
        text-align: left;
      }

      .custom-modal .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }

      .custom-modal .form-control {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
      }

      .custom-modal .submit-btn {
        background-color: #007BFF;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
        width: 100%;
      }

      .custom-modal .submit-btn:hover {
        background-color: #0056b3;
      }

      .custom-modal .close {
        font-size: 20px;
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        padding: 0;
        border-radius: 50%;
        height: 30px;
        width: 30px;
        line-height: 1;
        border: none;
      }

      .custom-modal .confirmation-message {
        margin-top: 20px;
        padding: 20px;
        background-color: #28a745;
        color: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
      }

      .custom-modal .confirmation-message svg {
        width: 24px;
        height: 24px;
        margin-right: 10px;
      }

      .custom-modal .error-message {
        margin-top: 20px;
        padding: 20px;
        background-color: #dc3545;
        color: white;
        border-radius: 8px;
      }

      .honeypot {
        position: absolute;
        width: 0;
        height: 0;
        padding: 0;
        margin: 0;
        border: 0;
        visibility: hidden;
      }
    `;
    document.head.appendChild(style);
  }

  open() {
    if (this.modal) {
      this.modal.style.display = "flex";
      this.modal.style.opacity = "1";
      this.modal.setAttribute("aria-hidden", "false");
      this.modalContent.setAttribute("tabindex", "-1");
      this.modalContent.focus();
    }
  }

  close() {
    this.modal.style.opacity = "0";
    this.timeout = setTimeout(this.cleanupForm.bind(this), 300);
    if (this.triggerElement) {
      this.triggerElement.focus();
    }
  }

  cleanupForm() {
    if (this.timeout) clearTimeout(this.timeout);
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone) {
    const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
    return phoneRegex.test(phone);
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const honeypot = this.form.querySelector(".honeypot");
    if (honeypot && honeypot.value) {
      this.showError("Please do not use autofill!");
      this.isSubmitting = false;
      return;
    }

    let isValid = true;
    const formData = new FormData(this.form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    if (data.email && !this.validateEmail(data.email)) {
      isValid = false;
      this.showError("Please enter a valid email address.");
    }

    if (data.phone && !this.validatePhone(data.phone)) {
      isValid = false;
      this.showError("Please enter a valid phone number.");
    }

    for (const key in data) {
      if (
        this.options.fields.find(
          (field) => field.name === key && field.required
        ) &&
        !data[key]
      ) {
        isValid = false;
        this.showError(
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`
        );
        break;
      }
    }

    if (!isValid) {
      this.isSubmitting = false;
      return;
    }

    const actionUrl = this.options.actionUrl;

    if (actionUrl) {
      fetch(actionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData) {
            this.showConfirmation(
              responseData.message || "Thank you for submitting the form!"
            );
          } else {
            this.showError(
              "There was an error submitting your form. Please try again."
            );
          }
        })
        .catch((error) => {
          this.showError(
            "An error occurred while submitting the form. Please try again."
          );
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    } else {
      this.showError("No action URL specified.");
      this.isSubmitting = false;
    }
  }

  showConfirmation(message) {
    if (this.confirmationMessage) {
      this.confirmationMessage.remove();
    }

    this.form.style.display = "none";
    const confirmationMessage = createEl("div", "confirmation-message");

    const checkMarkSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
    `;
    confirmationMessage.innerHTML = `${checkMarkSvg} ${message}`;
    this.modalContent.appendChild(confirmationMessage);
    setTimeout(this.close.bind(this), 10000);
  }

  showError(message) {
    if (this.confirmationMessage) {
      this.confirmationMessage.remove();
    }
    const errorMessage = createEl("div", "error-message");
    errorMessage.textContent = message;
    this.modalContent.appendChild(errorMessage);
    this.confirmationMessage = errorMessage;
  }

  create() {
    this.modal = createEl("div", "custom-modal");
    this.modal.setAttribute("role", "dialog");
    this.modal.setAttribute("aria-labelledby", "modal-title");
    this.modal.setAttribute("aria-hidden", "true");
    this.modalContent = createEl("div", "custom-modal-content");

    this.closeBtn = createEl("button", "close");
    this.closeBtn.setAttribute("aria-label", "Close Modal");
    this.closeBtn.innerHTML = "&times;";
    this.modalContent.appendChild(this.closeBtn);

    const title = createEl("h2");
    title.id = "modal-title";
    title.textContent = this.options.title || "Sign Up";
    this.modalContent.appendChild(title);

    this.form = createEl("form");
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    this.options.fields.forEach((field) => {
      const formGroup = createEl("div", "form-group");
      const label = createEl("label");
      label.setAttribute("for", field.name);
      label.textContent = field.label;
      formGroup.appendChild(label);

      let inputField;
      if (field.type === "select") {
        inputField = createEl("select", "form-control");
        field.options.forEach((op) => {
          const option = createEl("option");
          option.innerText = op;
          inputField.appendChild(option);
        });
      } else {
        inputField = createEl("input", "form-control");
        inputField.setAttribute("type", field.type || "text");
        inputField.setAttribute("placeholder", field.placeholder || "");
      }
      inputField.setAttribute("name", field.name);
      inputField.required = field.required || false;
      formGroup.appendChild(inputField);
      this.form.appendChild(formGroup);
    });

    const honeypotField = createEl("input", "honeypot");
    honeypotField.setAttribute("type", "text");
    honeypotField.setAttribute("name", "honeypot");
    this.form.appendChild(honeypotField);

    const submitBtn = createEl("button", "submit-btn");
    submitBtn.type = "submit";
    submitBtn.textContent = this.options.submitButtonText || "Submit";
    this.form.appendChild(submitBtn);

    this.modalContent.appendChild(this.form);
    this.modal.appendChild(this.modalContent);
    document.body.appendChild(this.modal);

    this.closeBtn.addEventListener("click", this.close.bind(this));
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    this.injectCSS();
  }
}

function initializeModals() {
  const modalTriggers = document.querySelectorAll("[data-form-modal]");

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function (evt) {
      evt.preventDefault();
      this.triggerElement = trigger;

      const title = trigger.getAttribute("data-title");
      const submitButtonText = trigger.getAttribute("data-submit-button-text");
      const fieldsJSON = trigger.getAttribute("data-form-modal");
      const actionUrl = trigger.getAttribute("data-action-url");

      const fields = JSON.parse(fieldsJSON);

      const modal = new Modal({
        title: title,
        submitButtonText: submitButtonText,
        fields: fields,
        actionUrl: actionUrl,
      });

      modal.create();
      modal.open();
    });
  });
}

document.addEventListener("DOMContentLoaded", initializeModals);
