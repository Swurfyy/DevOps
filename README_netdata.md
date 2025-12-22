# Netdata on AWS EC2 (chatty vind dak dees allemaal moet doen)

Deze repository installeert **Netdata automatisch** op een AWS EC2 Linux server.

---

## 🚀 Optie 1: Automatisch via cloud-init (aanrader)

1. Ga naar **EC2 → Launch instance**
2. Open **Advanced details**
3. Plak de inhoud van `cloud-init-netdata.yml` in **User data**
4. Start de instance

Na de eerste boot draait Netdata automatisch.

### URL
