<?php
	error_reporting(E_ALL|E_STRICT);
	ini_set('display_errors',1);
	ini_set('log_errors',1);
	ini_set('error_log', '../logs/error.log');
	assert_options(ASSERT_BAIL,1);
    
    // DELETED: db connection details

/**
 * Very basic streaming API example. In production you would store the
 * received tweets in a queue or database for later processing.
 *
 * Additional comments by artumi-richard
 *
 * Instructions:
 * 1) If you don't have one already, create a Twitter application on
 *      https://dev.twitter.com/apps
 * 2) From the application details page copy the consumer key and consumer
 *      secret into the place in this code marked with (YOUR_CONSUMER_KEY
 *      and YOUR_CONSUMER_SECRET)
 * 3) From the application details page copy the access token and access token
 *      secret into the place in this code marked with (A_USER_TOKEN
 *      and A_USER_SECRET)
 * 4) In a terminal or server type:
 *      php /path/to/here/streaming.php
 * 5) To stop the Streaming API either press CTRL-C or, in the folder the
 *      script is running from type:
 *      touch STOP
 *
 * @author themattharris
 */

function my_streaming_callback($data, $length, $metrics) {
  // Twitter sends keep alive's in their streaming API.
  // when this happens $data will appear empty.
  // ref: https://dev.twitter.com/docs/streaming-apis/messages#Blank_lines

  // decode the json response
  $tweet = json_decode($data, true);
  
  // filter out tweets that don't have ids or hashtags
  if (isset($tweet['id'])  && isset($tweet['entities']['hashtags']) && count($tweet['entities']['hashtags']) > 0) {

    // process hashtags
    $count = count($tweet['entities']['hashtags']);
    $hashtags = "";
    for ($i = 0; $i < $count; $i++) {
        $hashtags .= ($tweet['entities']['hashtags'][$i]['text'] . " ");
    }
    
    // insert tweet into database
    $insert_query = "INSERT INTO tweet_stream (id, hashtags) VALUES ('".$tweet['id']."', '".$hashtags."')";
    $GLOBALS['mysqli_conn']->query($insert_query);
    
    die();
  }
  return file_exists(dirname(__FILE__) . '/STOP');
}

require 'tmhOAuth-master/tmhOAuth.php';
require 'tmhOAuth-master/tmhUtilities.php';
$tmhOAuth = new tmhOAuth(array(
  'consumer_key'    => 'NmY7qCy8SL3Md7VORy04A',
  'consumer_secret' => 'ZUriaGa62R5j1VwnqpfnsrDn3iFAxIuUrt4n99mLJR0',
  'user_token'      => '467105495-JdnhL2QuicdZgFCJXRR6L2xfC6Y2dJiScdxvJXEx',
  'user_secret'     => '3jOWdI0bEtwMQsugeesCQ8tt9rCTCKbqMdips5s8g',
));

$method = 'https://stream.twitter.com/1.1/statuses/sample.json';

$params = array();

// connect to DB
$mysqli_conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

$tmhOAuth->streaming_request('GET', $method, $params, 'my_streaming_callback');

// output any response we get back AFTER the Stream has stopped -- or it errors
tmhUtilities::pr($tmhOAuth);