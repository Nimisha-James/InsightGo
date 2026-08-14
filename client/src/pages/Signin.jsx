import React, { useEffect, useState } from 'react';
import '../styles/SignIn.css'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signin = () => {
    const [notification, setNotification] = useState('');
    const [error, setError] = useState({ customer: '', business: '' });
    const [loginType, setLoginType] = useState('');
    
    const navigate = useNavigate();
    useEffect(() => {
        const handleCustomerSubmit = async (e) => {
            e.preventDefault();
            const fullname = document.getElementById('customerName').value;
            const email = document.getElementById('customerEmail').value;
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password === confirmPassword) {
                setNotification('Registration successful!');
                setError({ ...error,  customer: '' });
            } else {
                setError({ ...error, customer: 'Passwords do not match!' });
            }
            
            const response = await axios.post('http://localhost:8000/customer/signup', {
                fullname,
                email,
                password
            }).then((response) => {
                if (response.status === 201) {
                    const custId = response.data.user.cust_id;
                    navigate(`/form/${custId}`);
                  } else {
                    console.error(response.data.message); 
                }
            });

        };

        const handleBusinessSubmit = async (e) => {
            e.preventDefault();
            try{
            const business_name = document.getElementById('businessName').value;
            const email = document.getElementById('businessEmail').value;
            const contact = document.getElementById('contactNumber').value;
            const password = document.getElementById('newPasswordBusiness').value;
            const confirmPassword = document.getElementById('confirmPasswordBusiness').value;
    
            if (password !== confirmPassword) {
                console.log('Passwords do not match!')
                return;
            }
            
                const response = await axios.post('http://localhost:8000/business/signup', {
                    business_name,
                    email,
                    contact,
                    password
                }).then((response) => {
                    if (response.status === 201) {
                        const businessId = response.data.user.business_id;
                        navigate(`/business-owner/${businessId}`);
                      } else {
                        console.error(response.data.message); 
                    }
                });;
    
                console.log('Registration Successful!');
            } catch (error) {
                console.log('Try again later.')
            }      
        };        

        const loginBtn = document.querySelector('#signInFrom .submit-btn');

        const signUpCustomerBtn = document.querySelector('#customerFields .submit-btn');
        const signUpBusinessBtn = document.querySelector('#businessFields .submit-btn');
        
        if (signUpCustomerBtn) {
            signUpCustomerBtn.addEventListener('click', handleCustomerSubmit);
        }
        if (signUpBusinessBtn) {
            signUpBusinessBtn.addEventListener('click', handleBusinessSubmit);
        }
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin); 
        }

        return () => {
            if (signUpCustomerBtn) {
                signUpCustomerBtn.removeEventListener('click', handleCustomerSubmit);
            }
            if (signUpBusinessBtn) {
                signUpBusinessBtn.removeEventListener('click', handleBusinessSubmit);
            }
            if (loginBtn) {
                loginBtn.removeEventListener('click', handleLogin); 
            }
        };
    }, [error, navigate]); 


    const toggleForm = (formType) => {
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');
        const signInBtn = document.getElementById('signInBtn');
        const signUpBtn = document.getElementById('signUpBtn');

        if (formType === 'signIn') {
            signInForm.classList.add('active');
            signUpForm.classList.remove('active');
            signInBtn.classList.add('active');
            signUpBtn.classList.remove('active');
            signInForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            signInForm.classList.remove('active');
            signUpForm.classList.add('active');
            signInBtn.classList.remove('active');
            signUpBtn.classList.add('active');
            selectUserType('customer');
            signUpForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const selectUserType = (userType) => {
        const customerFields = document.getElementById('customerFields');
        const businessFields = document.getElementById('businessFields');
        const registrationTitle = document.getElementById('registrationTitle');

        if (userType === 'customer') {
            customerFields.style.display = 'block';
            businessFields.style.display = 'none';
            registrationTitle.textContent = 'User Registration';
        } else {
            customerFields.style.display = 'none';
            businessFields.style.display = 'block';
            registrationTitle.textContent = 'Business Registration';
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const loginType = document.querySelector('#signInForm #loginType').value;
            const email = document.querySelector('#signInForm #email').value; 
            const password = document.querySelector('#signInForm #password').value; 

            if (loginType === 'customer'){
                const response = await axios.post('http://localhost:8000/customer/signin', {
                    email,
                    password
                }).then((response) => {
                    if (response.status === 200) {
                        const custId = response.data.user.cust_id;
                        navigate(`/form/${custId}`);
                      } else {
                        console.error(response.data.message);
                    }
                });
                
            } 
            else if (loginType === 'business'){
                const response = await axios.post('http://localhost:8000/business/signin', {
                    email,
                    password
                }).then((response) => {
                    if (response.status === 200) {
                        const businessId = response.data.user.business_id;

                        navigate(`/business-owner/${businessId}`);
                      } else {
                        console.error(response.data.message);
                    }
                });
            } 

            console.log('Logged in successfully');
        } catch (error) {
            console.log('An error occurred');
        }
    }

    const handleLoginTypeChange = (e) => {
        setLoginType(e.target.value);
    };

    return (
        <div className="signin-page">
        <div className="container">
            <div className="header">
                <button
                    id="signInBtn"
                    className="toggle-btn active"
                    aria-pressed="true"
                    onClick={() => toggleForm('signIn')}
                >
                    Sign In
                </button>
                <button
                    id="signUpBtn"
                    className="toggle-btn"
                    aria-pressed="false"
                    onClick={() => toggleForm('signUp')}
                >
                    Sign Up
                </button>
            </div>
            <div className="form-container">
                {notification && (
                    <div id="successNotification" className="notification">
                        <p id="notificationMessage">{notification}</p>
                    </div>
                )}

                <div id="signInForm" className="form active">
                    <h3 id="registrationTitle">Sign In</h3>
                    <br></br>
                    <div className="formGroup">
                        <label htmlFor="loginType">Select User Type</label>
                        <select id="loginType" value={loginType} onChange={handleLoginTypeChange} className="block w-full">
                            <option value="customer">Customer</option>
                            <option value="business">Business</option>
                        </select>
                    </div>
                    <div className="formGroup">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" required />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" required />
                    </div>
                    <button className="submit-btn" onClick={handleLogin}>Login</button>
                    <p>
                        Don't have an account?{' '}
                        <a onClick={() => toggleForm('signUp')}>Sign Up</a>
                    </p>
                </div>

                <div id="signUpForm" className="form">
                    
                    <div className="user-type-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '1px', marginTop: '-40px' }}>
                        <button
                            className="user-type-btn active"
                            onClick={() => selectUserType('customer')}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c2925e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d8b48b'}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                backgroundColor: '#d8b48b',
                                color: 'rgb(45, 27, 4)',
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                textAlign: 'center',
                                minWidth: '100px',
                            }}
                        >
                            Customer
                        </button>
                        <button
                            className="user-type-btn"
                            onClick={() => selectUserType('business')}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c2925e'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d8b48b'} 
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '5px',
                                backgroundColor: '#d8b48b',
                                color: 'rgb(45, 27, 4)',
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                textAlign: 'center',
                                minWidth: '100px',
                            }}
                        >
                            Business
                        </button>
                    </div>


                    <br></br>
                    <br></br>

                    <div id="customerFields" className="user-fields" style={{ display: 'block' }}>
                        <h3 id="registrationTitle">User Registration</h3>
                        <br></br>
                        <div className="formGroup">
                            <label htmlFor="customerName">Full Name</label>
                            <input type="text" id="customerName" required />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="customerEmail">Email</label>
                            <input type="email" id="customerEmail" required />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="newPassword">New Password</label>
                            <input type="password" id="newPassword" required />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" required />
                        </div>
                        {error.customer && <p className="error-message">{error.customer}</p>}
                        <button className="submit-btn">Submit</button>
                    </div>


                    <div id="businessFields" className="user-fields" style={{ display: 'none' }}>
                        <h3 id="registrationTitle">Business Registration</h3>
                        <br></br>
                        <div className="formGroup">
                            <label htmlFor="businessName">Business Name</label>
                            <input type="text" id="businessName" required />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="businessEmail">Email</label>
                            <input type="email" id="businessEmail" required />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="contactNumber">Contact</label>
                            <input type="tel" id="contactNumber" required />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="newPasswordBusiness">New Password</label>
                            <input type="password" id="newPasswordBusiness" required />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="confirmPasswordBusiness">Confirm Password</label>
                            <input type="password" id="confirmPasswordBusiness" required />
                        </div>
                        {error.business && <p className="error-message">{error.business}</p>}
                        <button className="submit-btn">Submit</button>
                    </div>
                    <p>
                        Already have an account? <a onClick={() => toggleForm('signIn')}>Sign In</a>
                    </p>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Signin;