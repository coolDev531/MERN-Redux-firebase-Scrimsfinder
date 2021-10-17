import { memo } from 'react';

// components
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet';

// services and utils
import makeStyles from '@mui/styles/makeStyles';
const UserConversations = memo(({ conversations, changeToView }) => (
  <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Messenger: Conversations | Bootcamp LoL Scrim Gym</title>
    </Helmet>

    <Box
      component="ul"
      display="flex"
      flexDirection="column"
      style={{ maxHeight: '300px' }}>
      {conversations.map((conversation) => (
        <pre
          key={conversation._id}
          onClick={() => changeToView('chat-room', conversation)}>
          {JSON.stringify(conversation, null, 2)}
        </pre>
      ))}
    </Box>
  </>
));

export default UserConversations;
