import { memo } from 'react';

// components
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

// services and utils
import makeStyles from '@mui/styles/makeStyles';

const UserConversations = memo(({ conversations, changeToView }) => (
  <>
    <Box component="ul" display="flex" flexDirection="column">
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
