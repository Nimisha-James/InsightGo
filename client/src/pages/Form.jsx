import React, { useState } from 'react';
import '../styles/Form.css';
import TextInput from '../components/form/TextInput.jsx';
import Rating from '../components/form/Rating.jsx';
import TextReview from '../components/form/TextReview.jsx';
import CheckboxGroup from '../components/form/CheckboxGroup.jsx';
import ThankYouReview from './ThankYouReview.jsx';
import axios from 'axios';

function App() {
  const items = [
    { value: 'Mobile Phone', label: 'Mobile Phone' },
    { value: 'Laptop', label: 'Laptop' },
    { value: 'Refrigerator', label: 'Refrigerator' },
    { value: 'Air Conditioner', label: 'Air Conditioner' },
    { value: 'Washing Machine', label: 'Washing Machine' },
    { value: 'Microwave', label: 'Microwave' },
  ];

  const [formValues, setFormValues] = useState({
    name: '',
    contact: '',
    items: {},
    quantities: {},
    rating: null,
    review: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    let formErrors = {};

    if (!formValues.name.trim()) formErrors.name = "Name is required";

    if (!formValues.contact.trim()) {
      formErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formValues.contact)) {
      formErrors.contact = "Contact number must be 10 digits";
    }

    if (Object.keys(formValues.items).length === 0) formErrors.items = "At least one item must be selected";
    Object.keys(formValues.quantities).forEach(item => {
      if (formValues.items[item] && (!formValues.quantities[item] || formValues.quantities[item] <= 0)) {
        formErrors.quantities = "Please specify quantity for selected items";
      }
    });

    if (!formValues.rating) formErrors.rating = "Rating is required";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (validate()) {
  //     try{
  //       console.log(formValues);
  //       const response = await axios.post('http://localhost:8000/submit-form',
  //         formValues
  //       ).then((response) => {
  //         if(response.ok){
  //           alert(data.message); // Show success message
  //           // Reset form values
  //           setFormValues({
  //             name: '',
  //             contact: '',
  //             items: {},
  //             quantities: {},
  //             rating: null,
  //             review: ''
  //           });
  //         }
  //       })
  //     } catch(error) {
  //       console.error('Error submitting form:', error);
  //     }
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.post('http://localhost:8000/submit-form', formValues);
        if (response.status === 200) {
          setSubmitted(true); // Set submitted to true on success
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  };

  const handleInputChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  if (submitted) {
    return <ThankYouReview />; // Render Thank You page if submitted is true
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <h1>Help Us Serve You Better <br /> - Brown Bakery</h1>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Name"
            name="name"
            placeholder="Enter your name"
            required={true}
            value={formValues.name}
            onChange={handleInputChange}
            error={errors.name}
          />
          <TextInput
            label="Contact"
            name="contact"
            placeholder="Enter Contact no."
            required={true}
            value={formValues.contact}
            onChange={handleInputChange}
            error={errors.contact}
          />
          <CheckboxGroup
            label="Items Purchased"
            name="items"
            options={items}
            required={true}
            items={formValues.items}
            quantities={formValues.quantities}
            onChange={handleInputChange}
            error={errors.items || errors.quantities}
          />
          <div>
            <label>Rate Us:</label>
            <Rating
              rating={formValues.rating}
              onChange={(rating) => handleInputChange('rating', rating)}
              error={errors.rating}
            />
          </div>
          <TextReview
            value={formValues.review}
            onChange={(review) => handleInputChange('review', review)}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default App;