#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <HX711.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>

#define TFT_CS   15
#define TFT_DC   17
#define TFT_RST  2

Adafruit_ILI9341 tft(TFT_CS, TFT_DC, TFT_RST);

#define DT_PIN 16
#define SCK_PIN 4

HX711 scale;

float minWeight = 99999;
float maxWeight = 0;
float lastWeight = -1000;

bool wifiConnected = false;
bool mqttConnected = false;

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* mqttServer = "1c1c1007901b4873961419a9a7e88252.s1.eu.hivemq.cloud";
const int mqttPort = 8883;

const char* mqttUser = "Ashish";
const char* mqttPassword = "12345678";

WiFiClientSecure secureClient;
PubSubClient client(secureClient);

void connectMQTT() {

  while (!client.connected()) {

    Serial.print("Connecting to MQTT... ");

    if (client.connect("ESP32SmartScale", mqttUser, mqttPassword)) {

      Serial.println("Connected!");

    } else {

      Serial.print("Failed, rc=");
      Serial.println(client.state());

      delay(2000);

    }
  }
}

void setup() {


tft.begin();
tft.setRotation(1);
tft.fillScreen(ILI9341_BLACK);

// Title
tft.setTextColor(ILI9341_WHITE);
tft.setTextSize(2);
tft.setCursor(75,10);
tft.println("SMART SCALE");

// Horizontal lines
tft.drawFastHLine(0,35,320,ILI9341_DARKCYAN);
tft.drawFastHLine(0,200,320,ILI9341_DARKCYAN);

// Labels
tft.setTextSize(2);

tft.setCursor(20,210);
tft.print("Min:");

tft.setCursor(170,210);
tft.print("Max:");

tft.setCursor(20,185);
tft.print("Status:");

tft.drawRect(30,165,260,12,ILI9341_WHITE);

  Serial.begin(115200);

  scale.begin(DT_PIN, SCK_PIN);

// Choose a scale factor that gives reasonable values in Wokwi.
// You'll calibrate this on real hardware later.
scale.set_scale(420.0);

scale.tare();

Serial.println("HX711 Ready");

  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");

  }

  Serial.println();
  Serial.println("WiFi Connected!");
  wifiConnected = true;


  Serial.println(WiFi.localIP());

  secureClient.setInsecure();

  client.setServer(mqttServer, mqttPort);

}

void loop() {

  if (!client.connected()) {

    connectMQTT();
    mqttConnected = true;

  }

  client.loop();

  float weight = scale.get_units(10);
  // Update min/max
if(weight < minWeight)
    minWeight = weight;

if(weight > maxWeight)
    maxWeight = weight;

// Only refresh display if weight changes
if(abs(weight-lastWeight)>0.1){

    lastWeight = weight;

    // Clear weight area
    tft.fillRect(0,45,320,110,ILI9341_BLACK);

    // Dynamic color
    uint16_t color;

if(weight < 0.25)
    color = ILI9341_RED;
else if(weight < 2.0)
    color = ILI9341_ORANGE;
else
    color = ILI9341_GREEN;
    

    tft.setTextColor(color);
    tft.setTextSize(5);
    tft.setCursor(45,70);
    tft.print(weight,2);

    tft.setTextSize(3);
    tft.print(" Kg");

    // Capacity Bar
    float percent = weight/5.0;

    if(percent>1)
        percent=1;

    int width = percent*258;

    tft.fillRect(31,166,258,10,ILI9341_BLACK);
    tft.fillRect(31,166,width,10,color);

    if(weight < 0.25){

    tft.fillRect(20,135,280,25,ILI9341_RED);

    tft.setTextColor(ILI9341_WHITE);
    tft.setTextSize(2);
    tft.setCursor(55,140);
    tft.print("!!! LOW WEIGHT ALARM !!!");

}
else{

    tft.fillRect(20,135,280,25,ILI9341_BLACK);

}

    // Status
    tft.fillRect(110,182,180,18,ILI9341_BLACK);

tft.setTextSize(2);

if(weight < 0.25){

    tft.setTextColor(ILI9341_RED);
    tft.setCursor(110,185);
    tft.print("LOW WEIGHT!");

}
else{

    tft.setTextColor(ILI9341_CYAN);
    tft.setCursor(110,185);
    tft.print("NORMAL");

}

    // Min Weight
    tft.fillRect(65,208,70,20,ILI9341_BLACK);
    tft.setCursor(65,210);
    tft.setTextColor(ILI9341_WHITE);
    tft.print(minWeight,1);

    // Max Weight
    tft.fillRect(215,208,70,20,ILI9341_BLACK);
    tft.setCursor(215,210);
    tft.print(maxWeight,1);

    // WiFi Indicator
    tft.fillCircle(290,15,5,wifiConnected?ILI9341_GREEN:ILI9341_RED);

    // MQTT Indicator
    tft.fillCircle(305,15,5,mqttConnected?ILI9341_GREEN:ILI9341_RED);
}

// Publish MQTT
char msg[20];
dtostrf(weight,0,2,msg);

client.publish("smartscale/weight",msg);

Serial.print("Weight: ");
Serial.println(weight);

delay(500);

}

 