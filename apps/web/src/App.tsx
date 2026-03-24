import "./App.css";
import AppRouter from "./routes";
import { Toaster } from "~/components/ui/toast";
import Header from "~/components/Header";

function App() {
  return (
    <>
      <Header />
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
