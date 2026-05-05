export default function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="page-loading">
      <span className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}
