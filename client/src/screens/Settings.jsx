import { useContext, useState, useEffect, useMemo } from 'react';
import { Grid, TextField, Button } from '@material-ui/core';
import Navbar from '../components/shared/Navbar';
import { CurrentUserContext } from '../context/currentUser';
import { getUsersInRegion } from './../services/users';

export default function Settings() {
  const [currentUser, setCurrentUser] = useContext(CurrentUserContext);
  const [usersInRegion, setUsersInRegion] = useState([]);

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

  const [userData, setUserData] = useState({
    name: currentUser?.name, // LoL summoner name
    discord: currentUser?.discord,
    adminKey: currentUser?.adminKey ?? '',
    region: currentUser?.region ?? 'NA',
  });

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
      alert(`Summoner name ${userData.name} is already taken!`);
      return;
    }
    if (foundUserDiscord) {
      alert(`Discord name ${userData.discord} is already taken!`);
      return;
    }

    let yes = window.confirm(`are you sure you want to update your account? \n
    Summoner Name: ${userData.name} \n
    Region: ${userData.region} \n
    ${userData?.adminKey !== '' && `adminKey: ${userData.adminkey}`}
    `);

    if (!yes) return;
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
              style={{ marginLeft: 'auto', marginRight: 'auto' }}>
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
                <TextField
                  type="text"
                  name="name"
                  variant="filled"
                  value={userData.name || ''}
                  onChange={handleChange}
                  label="Summoner Name"
                  required
                />

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

              <Grid item>
                <TextField
                  variant="filled"
                  type="text"
                  fullWidth
                  name="adminKey"
                  value={userData.adminKey || ''}
                  onChange={handleChange}
                  label="Admin key (not required)"
                  helperText="You'll need an admin key to create scrims/lobbies."
                />
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
