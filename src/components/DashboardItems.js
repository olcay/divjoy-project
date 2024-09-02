import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from "@material-ui/core/styles";
import EditItemModal from "./EditItemModal";
import { useAuth } from "./../util/auth";
import { updateItem, useItemsByOwner } from "./../util/db";
import ToggleOnIcon from '@material-ui/icons/AlarmOn';
import ToggleOffIcon from '@material-ui/icons/AlarmOff';
import MoreTimeIcon from '@material-ui/icons/AddAlarm';

const useStyles = makeStyles((theme) => ({
  paperItems: {
    minHeight: "300px",
  },
  featured: {
    backgroundColor:
      theme.palette.type === "dark" ? theme.palette.action.selected : "#fdf8c2",
  },
  starFeatured: {
    color: theme.palette.warning.main,
  },
  isNotActive: {
    color: theme.palette.action.disabled,
  },
}));

function DashboardItems(props) {
  const classes = useStyles();

  const auth = useAuth();

  const {
    data: items,
    status: itemsStatus,
    error: itemsError,
  } = useItemsByOwner(auth.user.uid);

  const [creatingItem, setCreatingItem] = useState(false);

  const [updatingItemId, setUpdatingItemId] = useState(null);

  const itemsAreEmpty = !items || items.length === 0;

  const hasActivePlan =
    auth.user.planIsActive &&
    (auth.user.planId === "pro" || auth.user.planId === "business");

  const canAddMoreItem = hasActivePlan || itemsAreEmpty;

  const handleToggleItem = (item) => {
    updateItem(item.id, { isActive: !item.isActive });
  };

  function getStartAndEndOfDay(date) {
    return [
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(),
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime()
    ];
  }

  const handlePostponeItem = (item) => {
    var today = new Date();
    const months = parseFloat(item.interval.slice(0, -1));
    const newSendDate = new Date(today.setMonth(today.getMonth() + months));

    const [startOfNewSendDate, endOfNewEndDate] = getStartAndEndOfDay(newSendDate);

    if (item.sendDate >= startOfNewSendDate && item.sendDate <= endOfNewEndDate) {
      return null;
    }

    updateItem(item.id, { sendDate: newSendDate.getTime() });
  };

  return (
    <>
      {itemsError && (
        <Box mb={3}>
          <Alert severity="error">{itemsError.message}</Alert>
        </Box>
      )}

      <Paper className={classes.paperItems}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding={2}
        >
          <Typography variant="h5">Messages</Typography>
          <Tooltip title={canAddMoreItem ? "" : "Upgrade your plan"}>
            <span>
              <Button
                variant="contained"
                size="medium"
                color="primary"
                onClick={() => setCreatingItem(true)}
                disabled={!canAddMoreItem}
              >
                Add Message
              </Button>
            </span>
          </Tooltip>
        </Box>
        <Divider />

        {(itemsStatus === "loading" || itemsAreEmpty) && (
          <Box py={5} px={3} align="center">
            {itemsStatus === "loading" && <CircularProgress size={32} />}

            {itemsStatus !== "loading" && itemsAreEmpty && (
              <>
                Nothing yet. Click the button to add your first message.
                {!hasActivePlan && (<> Remaining messages: 1</>)}
              </>
            )}
          </Box>
        )}

        {itemsStatus !== "loading" && items && items.length > 0 && (
          <List disablePadding={true}>
            {items.map((item, index) => (
              <ListItem
                key={index}
                divider={index !== items.length - 1}
                className={item.featured ? classes.featured : ""}
                button={true}
                onClick={() => setUpdatingItemId(item.id)}
              >
                <ListItemText>{item.title}</ListItemText>
                <ListItemSecondaryAction>
                  <Tooltip title={item.isActive ? "On" : "Off"}>
                    <IconButton
                      edge="end"
                      aria-label="toggle"
                      onClick={() => handleToggleItem(item)}
                      className={item.isActive ? "" : classes.isNotActive}
                    >
                      {item.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Postpone">
                    <IconButton
                      edge="end"
                      aria-label="postpone"
                      onClick={() => handlePostponeItem(item)}
                    >
                      <MoreTimeIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {creatingItem && <EditItemModal onDone={() => setCreatingItem(false)} />}

      {updatingItemId && (
        <EditItemModal
          id={updatingItemId}
          onDone={() => setUpdatingItemId(null)}
        />
      )}
    </>
  );
}

export default DashboardItems;
