import React from "react";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import Alert from "@material-ui/lab/Alert";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import LinkMui from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import DashboardItems from "./DashboardItems";
import { Link, useRouter } from "./../util/router";
import { useAuth } from "./../util/auth";
import { capitalizeFirstLetter } from "./../util/util";

const useStyles = makeStyles((theme) => ({
  cardContent: {
    padding: theme.spacing(3),
  },
}));

function DashboardSection(props) {
  const classes = useStyles();

  const auth = useAuth();
  const router = useRouter();

  const hasActivePlan =
    auth.user.planIsActive &&
    (auth.user.planId === "pro" || auth.user.planId === "business");

  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container>
        <SectionHeader
          title={props.title}
          subtitle={props.subtitle}
          size={4}
          textAlign="center"
        />

        {router.query.paid && auth.user.planIsActive && (
          <Box mx="auto" mb={4} maxWidth={400}>
            <Alert severity="success">
              You are now subscribed to the {auth.user.planId} plan
              <span
                role="img"
                aria-label="party"
                style={{ marginLeft: "10px" }}
              >
                🥳
              </span>
            </Alert>
          </Box>
        )}

        <Grid container={true} spacing={4}>
          <Grid item={true} xs={12} md={6}>
            <DashboardItems />
          </Grid>
          <Grid item={true} xs={12} md={6}>
            <Card>
              <CardContent className={classes.cardContent}>
                <Box>
                  <Typography variant="h6" paragraph={true}>
                    <strong>What is this?</strong>
                  </Typography>
                  <Typography paragraph={true}>
                    Manage your messages here.
                  </Typography>
                  <Typography paragraph={true}>
                    Give your message a title to remember it easily.
                    The title will not be used in the email.
                  </Typography>
                  <Typography paragraph={true}>
                    You will get a reminder email <strong>10 days</strong> before the delivery date.
                    You may postpone the delivery through a link in that email or
                    you can update the message delivery date by changing the duration here.
                  </Typography>
                  <Box mt={3}>
                    <Typography variant="h6" paragraph={true}>
                      <strong>Subscription</strong>
                    </Typography>
                    <Typography component="div">
                      {!auth.user.name && (
                        <>
                          <div>
                            Your name is empty. It would be better for the recipient to see your name.{` `}
                            You can add your name to your account info{` `}
                            in{` `}
                            <LinkMui component={Link} to="/settings/general">
                              <strong>settings</strong>
                            </LinkMui>
                            .
                          </div>
                        </>
                      )}

                      {!hasActivePlan && (
                        <>
                          <div>
                            You are not subscribed to any plan yet. You can only add <strong>1 message</strong>.
                          </div>
                          <div>
                            You can subscribe to a plan in{" "}
                            <LinkMui component={Link} to="/pricing">
                              <strong>pricing</strong>
                            </LinkMui>
                            .
                          </div>
                        </>
                      )}

                      {hasActivePlan && (
                        <>
                          <div>
                            You are subscribed to the{" "}
                            <strong>{capitalizeFirstLetter(auth.user.planId)} plan</strong>.
                          </div>
                        </>
                      )}


                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Section>
  );
}

export default DashboardSection;
