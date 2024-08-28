import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import { useAuth } from "./../util/auth";
import { useItem, updateItem, createItem } from "./../util/db";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const useStyles = makeStyles((theme) => ({
  content: {
    paddingBottom: 24,
  },
}));

function EditItemModal(props) {
  const classes = useStyles();

  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);

  const { register, handleSubmit, errors } = useForm();

  const [interval, setInterval] = useState('1M');
  const [sendDate, setSendDate] = useState(addMonths(1));
  const [hasIntervalChanged, setHasIntervalChanged] = useState(false);

  function addMonths(months) {
    var date = new Date();
    return new Date(date.setMonth(date.getMonth() + months)).getTime();
  }



  function generateRandomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const handleChange = (event) => {
    setHasIntervalChanged(true);
    setInterval(event.target.value);
    const months = parseFloat(event.target.value.slice(0, -1));
    setSendDate(addMonths(months));

    if (itemData) {
      itemData.interval = event.target.value;
      itemData.sendDate = addMonths(months);
    }
  };

  // This will fetch item if props.id is defined
  // Otherwise query does nothing and we assume
  // we are creating a new item.
  const { data: itemData, status: itemStatus } = useItem(props.id);

  // If we are updating an existing item
  // don't show modal until item data is fetched.
  if (props.id && itemStatus !== "success") {
    return null;
  }

  const onSubmit = (data) => {
    setPending(true);

    if (props.id) {
      if (hasIntervalChanged) {
        data.interval = interval;
        data.sendDate = sendDate;
      }
    } else {
      data.postponeCode = generateRandomCode(10);
      data.isActive = true;
      data.interval = interval;
      data.sendDate = sendDate;
    }

    const query = props.id
      ? updateItem(props.id, data)
      : createItem({ owner: auth.user.uid, ...data });

    query
      .then(() => {
        // Let parent know we're done so they can hide modal
        props.onDone();
      })
      .catch((error) => {
        // Hide pending indicator
        setPending(false);
        // Show error alert message
        setFormAlert({
          type: "error",
          message: error.message,
        });
      });
  };

  return (
    <Dialog open={true} onClose={props.onDone}>
      <DialogTitle>
        {props.id && <>Update</>}
        {!props.id && <>Create</>}
        {` `}Message
      </DialogTitle>
      <DialogContent className={classes.content}>
        {formAlert && (
          <Box mb={4}>
            <Alert severity={formAlert.type}>{formAlert.message}</Alert>
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container={true} spacing={3}>
            <Grid item={true} xs={12}>
              <TextField
                variant="outlined"
                type="text"
                label="Title"
                name="name"
                defaultValue={itemData && itemData.name}
                error={errors.name ? true : false}
                helperText={errors.name && errors.name.message}
                fullWidth={true}
                autoFocus={true}
                inputRef={register({
                  required: "Please enter a title",
                })}
              />
            </Grid>
            <Grid item={true} xs={12}>
              <TextField
                variant="outlined"
                type="email"
                label="Recipient"
                name="recipient"
                defaultValue={itemData && itemData.recipient}
                error={errors.recipient ? true : false}
                helperText={errors.recipient && errors.recipient.message}
                fullWidth={true}
                autoFocus={true}
                inputRef={register({
                  required: "Please enter a recipient email address",
                })}
              />
            </Grid>
            <Grid item={true} xs={12}>
              <TextField
                variant="outlined"
                multiline
                minRows={4}
                label="Message"
                name="message"
                defaultValue={itemData && itemData.message}
                error={errors.message ? true : false}
                helperText={errors.message && errors.message.message}
                fullWidth={true}
                autoFocus={true}
                inputRef={register({
                  required: "Please enter a message",
                })}
              />
            </Grid>
            <Grid item={true} xs={12}>
              <FormControl>
                <FormLabel id="interval-label">Interval</FormLabel>
                <RadioGroup
                  row
                  name="interval"
                  value={itemData && itemData.interval}
                  defaultValue="1M"
                  onChange={handleChange}
                >
                  <FormControlLabel value="1M" control={<Radio />} label="1 month" />
                  <FormControlLabel value="6M" control={<Radio />} label="6 months" />
                  <FormControlLabel value="12M" control={<Radio />} label="12 months" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item={true} xs={12}>
              <FormControl>
                <FormLabel>The message will be sent on {itemData ? new Date(itemData.sendDate).toDateString() : new Date(sendDate).toDateString()}.</FormLabel>

              </FormControl>
            </Grid>
            <Grid item={true} xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={pending}
              >
                {!pending && <span>Save</span>}

                {pending && <CircularProgress size={28} />}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditItemModal;
