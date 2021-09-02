import { useContext, useState, useEffect, useMemo } from 'react';
import {
  Grid,
  TextField,
  Button,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  makeStyles,
} from '@material-ui/core';
import Navbar from '../components/shared/Navbar';
import { CurrentUserContext } from '../context/currentUser';

// services
import { getUsersInRegion, updateUser } from './../services/users';

// remove spaces from # in discord name
const removeSpaces = (str) => {
  return str
    .trim()
    .replace(/\s([#])/g, function (el1, el2) {
      return '' + el2;
    })
    .replace(/(«)\s/g, function (el1, el2) {
      return el2 + '';
    });
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
}));
// userEdit
export default function Settings() {
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const [usersInRegion, setUsersInRegion] = useState([]);
  const [userData, setUserData] = useState({
    name: currentUser?.name, // LoL summoner name
    discord: currentUser?.discord,
    adminKey: currentUser?.adminKey ?? '',
    region: currentUser?.region ?? 'NA',
  });
  const classes = useStyles();

  const foundUserSummonerName = useMemo(
    () =>
      usersInRegion.find(
        // make sure it's not the same user with uid.
        ({ name, _id }) => {
          if (_id === currentUser._id) {
            return false;
          }

          return name === userData.name;
        }
      ),
    [userData.name, usersInRegion, currentUser?._id]
  );

  const foundUserDiscord = useMemo(
    () =>
      usersInRegion.find(({ discord, _id }) => {
        // make sure it's not the same user with _id.
        if (_id === currentUser._id) {
          return false;
        }

        return removeSpaces(discord) === removeSpaces(userData.discord);
      }),
    [userData.discord, usersInRegion, currentUser?._id]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      // for checking if summoner name or discord are taken.
      const usersInRegionData = await getUsersInRegion(userData.region);

      setUsersInRegion(usersInRegionData);
    };
    fetchUsers();
  }, [userData.region]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (foundUserSummonerName) {
      alert(
        `Summoner name ${userData.name} in ${userData.region} is already taken!`
      );
      return;
    }
    if (foundUserDiscord) {
      alert(`Discord name ${userData.discord} is already taken!`);
      return;
    }

    let yes = window.confirm(`are you sure you want to update your account? \n
    Summoner Name: ${userData.name} \n
    Region: ${userData.region} \n
    ${userData.adminKey ? 'Admin key: ' + userData.adminKey : ''}
    `);

    if (!yes) return;
    try {
      const updatedUser = await updateUser(currentUser?._id, userData);
      alert('Account details updated!');

      if (updatedUser) {
        setUserData({ ...updatedUser });
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('ERROR:', error);
      alert(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <Navbar showLess />
      <main className="page-content">
        <div className="inner-column">
          <form onSubmit={handleSubmit}>
            <Grid
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              spacing={4}
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'auto',
              }}>
              <Grid item>
                <h1>Settings</h1>
              </Grid>

              <Grid
                item
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={4}>
                <Grid item>
                  <TextField
                    type="text"
                    name="name"
                    variant="filled"
                    value={userData.name || ''}
                    onChange={handleChange}
                    label="Summoner Name"
                    required
                  />
                </Grid>

                <Grid item>
                  <TextField
                    type="text"
                    variant="filled"
                    name="discord"
                    value={userData.discord || ''}
                    onChange={handleChange}
                    label="Discord (name and #)"
                    required
                  />
                </Grid>
              </Grid>

              <Grid
                item
                container
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={4}>
                <Grid item>
                  <FormControl className={classes.formControl} variant="filled">
                    <InputLabel>Region</InputLabel>
                    <Select
                      name="region"
                      value={userData.region}
                      onChange={handleChange}
                      required>
                      <MenuItem selected disabled>
                        select region
                      </MenuItem>
                      {['NA', 'EUW', 'EUNE', 'LAN'].map((region, key) => (
                        <MenuItem value={region} key={key}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item>
                  <TextField
                    variant="filled"
                    type="text"
                    // fullWidth
                    name="adminKey"
                    value={userData.adminKey || ''}
                    onChange={handleChange}
                    label="Admin key (not required)"
                  />
                </Grid>
              </Grid>

              <div className="page-break" />
              <Grid item>
                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </div>
      </main>
    </>
  );
}
