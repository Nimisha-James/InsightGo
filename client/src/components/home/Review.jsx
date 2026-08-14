import React from 'react';

const reviews = [
  {
    name: "John Doe",
    business: "Doe's Bakery",
    review:
      "InsightGo has revolutionized how we understand our customers! Their analytics helped us optimize operations and boost sales.",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Jane Smith",
    business: "Smith's Bakery",
    review:
      "The insights we gain are invaluable! Sales have significantly improved since we started following the recommendations.",
    rating: 4,
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    name: "Michael Johnson",
    business: "Johnson's Café",
    review:
      "As a small business, I can say this platform has helped us thrive. Highly recommended!",
    rating: 5,
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
  },
];

const Review = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative py-16 px-6 bg-gradient-to-b from-cream-300 to-cream-100">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-5xl font-bold text-brown-900 text-center mb-12">
          What Our Clients Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg transform transition duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-6">
                <img
                  src={review.avatar}
                  alt={`${review.name}'s avatar`}
                  className="w-16 h-16 rounded-full mr-4 border-4 border-brown-300 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-semibold text-brown-900">
                    {review.name}
                  </h3>
                  <p className="text-brown-700">{review.business}</p>
                </div>
              </div>

              <p className="text-brown-800 text-lg mb-6 leading-relaxed">
                "{review.review}"
              </p>

              <div className="flex">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-6 h-6 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.97 0 1.371 1.24.588 1.81l-3.37 2.453a1 1 0 00-.363 1.118l1.286 3.958c.3.921-.755 1.688-1.54 1.118l-3.37-2.453a1 1 0 00-1.176 0l-3.37 2.453c-.785.57-1.84-.197-1.54-1.118l1.286-3.958a1 1 0 00-.363-1.118L2.85 9.385c-.783-.57-.382-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Review;
