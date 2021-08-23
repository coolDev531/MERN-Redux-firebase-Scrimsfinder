import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { Button, FormHelperText } from '@material-ui/core';
import { useContext } from 'react';
import { CurrentUserContext } from '../../context/currentUser';
import { useHistory } from 'react-router-dom';

export default function Navbar({
  toggleFetch,
  setScrimsRegion,
  scrimsRegion,
  onSelectRegion,
}) {
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);
  const history = useHistory();
  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  return (
    <div className="page-section site-header">
      <div className="inner-column">
        <div className="d-flex align-center justify-between">
          <div className="logo">
            <h1>LoL Scrims Finder</h1>
          </div>

          <div className="d-flex mr-3">
            <Button
              onClick={() => {
                history.push('./user-setup');
                setCurrentUser(null);
              }}
              variant="contained"
              color="secondary">
              Log Out
            </Button>
          </div>
        </div>
        <br />
        <div className="d-flex align-center justify-between">
          <div>
            <h2>Welcome: {currentUser?.name}</h2>
          </div>

          <div>
            <InputLabel className="text-white">Region</InputLabel>

            <Select
              value={scrimsRegion}
              className="text-white"
              onChange={(e) => {
                const region = e.target.value;
                toggleFetch((prev) => !prev);
                setScrimsRegion(region);
                onSelectRegion(region);
              }}>
              {selectRegions.map((region) => (
                <MenuItem value={region}>{region}</MenuItem>
              ))}
            </Select>
            <FormHelperText className="text-white">
              Filter scrims by region
            </FormHelperText>
          </div>
        </div>
      </div>
    </div>
  );
}
