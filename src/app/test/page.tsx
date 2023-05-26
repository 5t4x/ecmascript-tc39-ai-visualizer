export default function Test() {
  return (
    <div className="container">
      <div className="mt-4 p-5 bg-primary text-white rounded">
        <h1 className="text-white">Temporal Proposal</h1>
        <p>
          Provides standard objects and functions for working with dates and
          times.
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Status</h5>
          <p className="card-text">
            This proposal is currently Stage 3 and was reviewed by Richard
            Gibson, Bradley Farias, and Daniel Ehrenberg. Implementers of this
            proposal MUST NOT ship unflagged Temporal implementations until IETF
            standardizes timezone/calendar string serialization formats.
          </p>
        </div>
      </div>
    </div>
  );
}
