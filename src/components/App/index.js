import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography } from "@material-ui/core";
import Home from "./../Home";
import "./style.css";

const App = () => {
  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap>
            Block Challenge
          </Typography>
        </Toolbar>
      </AppBar>
      <Box pt={8}>
        <Router>
          <Route exact path="/" component={Home} />
        </Router>
      </Box>
    </Box>
  );
};

export default App;
