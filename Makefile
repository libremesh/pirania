#
# Copyright (C) 2006-2013 OpenWrt.org
#
# This is free software, licensed under the GNU General Public License v3.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=lime-pitbull
PKG_VERSION=$(GIT_COMMIT_DATE)-$(GIT_COMMIT_TSTAMP)
GIT_COMMIT_DATE:=$(shell git log -n 1 --pretty=%ad --date=short . )
GIT_COMMIT_TSTAMP:=$(shell git log -n 1 --pretty=%at . )

include $(INCLUDE_DIR)/package.mk

define Package/$(PKG_NAME)
 SECTION:=net
 CATEGORY:=Network
 TITLE:=$(PKG_NAME)
 MAINTAINER:=Nicolas Pace <nicopace@libre.ws>
 DEPENDS:= +ip6tables-mod-nat
endef

define Package/$(PKG_NAME)/description
  Captive Portal for routers that want to share their Internet connection via bouchers.
endef

define Build/Compile
endef

define Package/$(PKG_NAME)/install
	$(CP) ./files/* $(1)/
	$(CP) ./luasrc/* /usr/lib/lua/luci/$(1)/
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
