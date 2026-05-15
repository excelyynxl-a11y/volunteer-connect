import React from "react";
import Badge from "../../components/Badge";
import "./LoadingPage.css";

const LoadingPage = ({ message = "Loading..." }) => {
  return (
    <main className="loading-page" aria-busy="true" aria-live="polite">
      <section className="loading-card">
        <Badge icon="V" name="VolunteerConnect" subtitle="Please wait" />
        <div className="loading-spinner" />
        <p>{message}</p>
      </section>
    </main>
  );
};

export default LoadingPage;
