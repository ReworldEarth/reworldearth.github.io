import ErrorBoundary from "./components/ErrorBoundary";
import Location from "./components/Location";
import { continentLocation, donors } from "./data.json";
import { ContinentLocation, Donor } from "./types";

function App() {
  return (
    <ErrorBoundary>
      <Location
        continentLocation={continentLocation as unknown as ContinentLocation}
        donors={donors as unknown as Donor[]}
      />
    </ErrorBoundary>
  );
}

export default App;
